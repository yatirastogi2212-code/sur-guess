import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  XCircle,
  Trophy,
  Sparkles,
  Search,
  Volume2,
  Info
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { api } from '../services/api';
import { AudioVisualizer } from './AudioVisualizer';
import { QuizQuestion, GuessResult, SongAutocomplete } from '../types';

interface Props {
  initialQuestion?: QuizQuestion;
  onFinish?: () => void;
  lang: 'en' | 'hi';
}

const STAGES = [0.1, 0.5, 1.0, 2.0, 4.0, 8.0, 15.0];

export const ProgressiveGame: React.FC<Props> = ({ initialQuestion, lang }) => {
  const [question, setQuestion] = useState<QuizQuestion | null>(initialQuestion || null);
  const [loading, setLoading] = useState<boolean>(!initialQuestion);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [guess, setGuess] = useState<string>('');
  const [suggestions, setSuggestions] = useState<SongAutocomplete[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [result, setResult] = useState<GuessResult | null>(null);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [elapsedTimer, setElapsedTimer] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const timerRef = useRef<number | null>(null);
  const autoPlayTimerRef = useRef<number | null>(null);

  // Initialize or fetch first question
  useEffect(() => {
    if (!initialQuestion) {
      loadNewGame();
    } else {
      setQuestion(initialQuestion);
    }
    return () => {
      audioEngine.stop();
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [initialQuestion]);

  useEffect(() => {
    if (question) {
      const url = question.previewUrl || question.sourceUrl;
      if (url) {
        audioEngine.preloadAudio(url, question.snippetStartOffset || 5.0);
      }
    }
  }, [question]);

  const loadNewGame = async () => {
    setLoading(true);
    setResult(null);
    setFeedback(null);
    try {
      const q = await api.startQuiz('PROGRESSIVE', undefined, undefined, 5);
      setQuestion(q);
      startTimer();
    } catch (err) {
      console.error(err);
      setFeedback({ text: 'Failed to start game. Please ensure backend is running.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setElapsedTimer(0);
    timerRef.current = window.setInterval(() => {
      setElapsedTimer(prev => prev + 0.1);
    }, 100);
  };

  // Play current snippet
  const handlePlayAudio = () => {
    if (!question) return;
    setIsPlaying(true);
    const audioUrl = question.previewUrl || question.sourceUrl;
    audioEngine.playClip(
      question.signatureRiffNotes,
      audioUrl,
      question.currentDurationSeconds,
      question.snippetStartOffset || 5.0,
      () => {
        setIsPlaying(false);
      }
    );
  };

  // Autocomplete search
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (guess.trim().length >= 2) {
        const matches = await api.autocomplete(guess);
        setSuggestions(matches);
        setShowSuggestions(matches.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    const t = setTimeout(fetchSuggestions, 150);
    return () => clearTimeout(t);
  }, [guess]);

  const handleSelectSuggestion = (s: SongAutocomplete) => {
    setGuess(s.titleEn);
    setShowSuggestions(false);
  };

  // Submit guess
  const handleSubmitGuess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question || !guess.trim()) return;

    try {
      const res = await api.submitGuess(
        question.sessionToken,
        guess.trim(),
        false,
        elapsedTimer
      );
      processGuessResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  // Skip to reveal more
  const handleSkip = async () => {
    if (!question) return;
    try {
      const res = await api.submitGuess(
        question.sessionToken,
        '',
        true,
        elapsedTimer
      );
      processGuessResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  const processGuessResult = (res: GuessResult) => {
    setResult(res);
    setTotalScore(res.currentTotalScore);

    if (res.correct) {
      audioEngine.stop();
      setIsPlaying(false);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setFeedback({ text: res.feedbackMessage, type: 'success' });
    } else if (res.roundEnded) {
      audioEngine.stop();
      setIsPlaying(false);
      setFeedback({ text: res.feedbackMessage, type: 'error' });
    } else {
      setFeedback({ text: res.feedbackMessage, type: 'info' });
      // Update duration in active question
      if (question) {
        setQuestion({
          ...question,
          currentStage: res.nextStage,
          currentDurationSeconds: res.nextDurationSeconds
        });
        // Auto play the new longer snippet
        if (autoPlayTimerRef.current !== null) {
          clearTimeout(autoPlayTimerRef.current);
        }
        autoPlayTimerRef.current = window.setTimeout(() => {
          setIsPlaying(true);
          const audioUrl = question.previewUrl || question.sourceUrl;
          audioEngine.playClip(
            question.signatureRiffNotes,
            audioUrl,
            res.nextDurationSeconds,
            question.snippetStartOffset || 5.0,
            () => setIsPlaying(false)
          );
        }, 200);
      }
    }
    setGuess('');
    setShowSuggestions(false);
  };

  const handleNextQuestion = async () => {
    if (!question) return;
    setResult(null);
    setFeedback(null);
    setGuess('');
    audioEngine.stop();
    setLoading(true);

    try {
      const nextQ = await api.startQuiz('PROGRESSIVE', undefined, undefined, 5);
      setQuestion(nextQ);
      startTimer();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-300">
        <div className="w-12 h-12 border-4 border-bollywood-gold border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-lg font-medium">{lang === 'hi' ? 'धुन लोड हो रही है...' : 'Loading Bollywood snippet...'}</p>
      </div>
    );
  }

  const currentStage = question?.currentStage || 1;
  const currentDuration = question?.currentDurationSeconds || 0.1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Top Header & Score Card */}
      <div className="flex items-center justify-between mb-6 bg-bollywood-surface/80 p-4 rounded-2xl border border-bollywood-border/70 backdrop-blur-md">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-bollywood-gold">
            {lang === 'hi' ? 'राउंड 1 / 5' : 'Round 1 of 5'}
          </span>
          <h2 className="text-xl font-black text-white">
            {lang === 'hi' ? 'कम से कम सेकंड में पहचानें' : 'Guess in Minimum Audio'}
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-xl border border-amber-500/30">
          <Trophy className="w-5 h-5 text-bollywood-gold" />
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">{lang === 'hi' ? 'स्कोर' : 'SCORE'}</div>
            <div className="text-lg font-black text-amber-400">{totalScore}</div>
          </div>
        </div>
      </div>

      {/* Progressive Stage Ladder */}
      <div className="mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            {lang === 'hi' ? 'ऑडियो एक्सपोज़र स्टेज' : 'Audio Exposure Ladder'}
          </span>
          <span className="text-xs font-bold text-bollywood-gold">
            {currentDuration}s {lang === 'hi' ? 'अनलॉक' : 'Unlocked'}
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {STAGES.map((sec, idx) => {
            const stageNum = idx + 1;
            const isUnlocked = stageNum <= currentStage;
            const isCurrent = stageNum === currentStage;
            return (
              <div
                key={sec}
                className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-t from-amber-500 to-orange-400 text-slate-950 shadow-md shadow-amber-500/30 scale-105 ring-2 ring-amber-300'
                    : isUnlocked
                    ? 'bg-slate-800 text-slate-200 border border-slate-700'
                    : 'bg-slate-900/60 text-slate-600 border border-slate-900'
                }`}
              >
                <div>{sec}s</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Central Audio Play Console */}
      <div className="bg-gradient-to-b from-bollywood-surface to-slate-950 p-6 rounded-3xl border border-bollywood-border shadow-2xl mb-6 text-center">
        {/* Animated Visualizer */}
        <AudioVisualizer isPlaying={isPlaying} />

        <div className="mt-4 flex flex-col items-center">
          <button
            onClick={handlePlayAudio}
            disabled={isPlaying}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-xl ${
              isPlaying
                ? 'bg-amber-500/20 border-2 border-amber-400 animate-pulse text-amber-400 shadow-amber-500/30'
                : 'bg-gradient-to-tr from-bollywood-gold via-bollywood-saffron to-bollywood-ruby text-slate-950 hover:scale-105 shadow-orange-500/30'
            }`}
          >
            {isPlaying ? (
              <Volume2 className="w-10 h-10 animate-bounce" />
            ) : currentStage > 1 ? (
              <RotateCcw className="w-9 h-9 stroke-[2.5]" />
            ) : (
              <Play className="w-10 h-10 ml-1 stroke-[2.5]" />
            )}
          </button>
          <span className="mt-2 text-xs font-semibold text-slate-400 flex items-center gap-1">
            {isPlaying
              ? (lang === 'hi' ? 'गाना बज रहा है...' : `Playing ${currentDuration}s vocal snippet...`)
              : (lang === 'hi' ? 'सुनने के लिए क्लिक करें' : `Tap to listen (${currentDuration}s)`)}
          </span>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-amber-300 flex items-center gap-1">
              <span>🎯</span>
              <span>Hook starts at {question?.snippetStartOffset || 5.0}s</span>
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
              <span>🎙️</span>
              <span>Original Vocal Master</span>
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`mb-4 p-3.5 rounded-xl border flex items-center gap-2 text-sm font-semibold transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
              : feedback.type === 'error'
              ? 'bg-rose-950/70 border-rose-500/50 text-rose-300'
              : 'bg-amber-950/70 border-amber-500/50 text-amber-300'
          }`}
        >
          {feedback.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />}
          {feedback.type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />}
          {feedback.type === 'info' && <Info className="w-5 h-5 flex-shrink-0 text-amber-400" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Guess Input Form */}
      {!result?.roundEnded ? (
        <form onSubmit={handleSubmitGuess} className="relative mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={guess}
              onChange={e => setGuess(e.target.value)}
              placeholder={
                lang === 'hi'
                  ? 'गीत का नाम लिखें (जैसे: तुझे देखा तो, Chura Liya Hai...)'
                  : 'Type song title or movie name (Romanized or Devanagari)...'
              }
              className="w-full pl-11 pr-24 py-3.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-bollywood-gold focus:ring-1 focus:ring-bollywood-gold"
            />
            <button
              type="submit"
              disabled={!guess.trim()}
              className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-bollywood-gold text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-400 disabled:opacity-40 transition-colors"
            >
              {lang === 'hi' ? 'जवाब दें' : 'Guess'}
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-30 left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
              {suggestions.map(s => (
                <div
                  key={s.id}
                  onClick={() => handleSelectSuggestion(s)}
                  className="px-4 py-2.5 hover:bg-slate-800/80 cursor-pointer border-b border-slate-800/60 last:border-none flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-white text-sm">
                      {s.titleEn} <span className="text-xs text-amber-400/90 font-normal">({s.titleHi})</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {s.filmTitleEn} ({s.releaseYear}) • {s.singers}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skip / Reveal More Action Button */}
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              {lang === 'hi' ? 'कठिन लग रहा है?' : 'Need more audio?'}
            </span>
            <button
              type="button"
              onClick={handleSkip}
              className="px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <SkipForward className="w-4 h-4 text-amber-400" />
              {currentStage >= 7
                ? (lang === 'hi' ? 'हार मानें / गाना देखें' : 'Give Up & Reveal Song')
                : (lang === 'hi' ? `छोड़ें / और सुनें (+${STAGES[currentStage]}s)` : `Skip / Reveal More (+${STAGES[currentStage]}s)`)}
            </button>
          </div>
        </form>
      ) : (
        /* Round End Reveal Card */
        <div className="bg-bollywood-surface p-6 rounded-3xl border border-bollywood-border shadow-2xl mb-6 animate-fadeIn">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-bollywood-gold uppercase tracking-wider">
                {result.correct ? '🎉 SAHI JAWAB! (CORRECT)' : '❌ ROUND OVER'}
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                {result.revealedSong?.titleEn}
              </h3>
              <p className="text-lg text-amber-400 font-hindi">
                {result.revealedSong?.titleHi}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-semibold">POINTS WON</span>
              <span className="text-2xl font-black text-emerald-400">+{result.pointsAwarded}</span>
            </div>
          </div>

          {/* Credits Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 mb-4">
            <div>
              <span className="text-slate-400 font-semibold block">FILM / MOVIE</span>
              <span className="text-white font-bold">{result.revealedSong?.filmTitleEn} ({result.revealedSong?.releaseYear})</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">DECADE & GENRE</span>
              <span className="text-white font-bold">{result.revealedSong?.decade} • {result.revealedSong?.primaryGenre}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">PLAYBACK SINGERS</span>
              <span className="text-white font-bold">{result.revealedSong?.singers.join(', ')}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">MUSIC DIRECTORS</span>
              <span className="text-white font-bold">{result.revealedSong?.musicDirectors.join(', ')}</span>
            </div>
          </div>

          {/* Trivia Story */}
          {result.revealedSong?.triviaFact && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-bollywood-gold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>BOLLYWOOD TRIVIA STORY</span>
              </div>
              <p className="leading-relaxed">{result.revealedSong.triviaFact}</p>
            </div>
          )}

          <button
            onClick={handleNextQuestion}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-bollywood-gold to-bollywood-saffron text-slate-950 font-black text-sm uppercase tracking-wider hover:opacity-95 transition-opacity"
          >
            {result.gameEnded ? 'View Final Results / Play Again' : 'Next Song ➔'}
          </button>
        </div>
      )}
    </div>
  );
};
