import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Calendar, Share2, Check, Trophy, Play, RotateCcw, SkipForward, Search } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { api } from '../services/api';
import { AudioVisualizer } from './AudioVisualizer';
import { QuizQuestion, GuessResult, SongAutocomplete } from '../types';

interface Props {
  lang: 'en' | 'hi';
}

const STAGES = [0.1, 0.5, 1.0, 2.0, 4.0, 8.0, 15.0];

export const DailyChallenge: React.FC<Props> = ({ lang }) => {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [guess, setGuess] = useState<string>('');
  const [suggestions, setSuggestions] = useState<SongAutocomplete[]>([]);
  const [result, setResult] = useState<GuessResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<boolean[]>([]); // record of guesses/skips

  useEffect(() => {
    loadDaily();
    return () => audioEngine.stop();
  }, []);

  const loadDaily = async () => {
    setLoading(true);
    try {
      const q = await api.getDailyQuiz();
      setQuestion(q);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMatches = async () => {
      if (guess.trim().length >= 2) {
        const matches = await api.autocomplete(guess);
        setSuggestions(matches);
      } else {
        setSuggestions([]);
      }
    };
    const t = setTimeout(fetchMatches, 150);
    return () => clearTimeout(t);
  }, [guess]);

  const handlePlayAudio = () => {
    if (!question) return;
    setIsPlaying(true);
    const audioUrl = question.previewUrl || question.sourceUrl;
    audioEngine.playClip(
      question.signatureRiffNotes,
      audioUrl,
      question.currentDurationSeconds,
      question.snippetStartOffset || 5.0,
      () => setIsPlaying(false)
    );
  };

  const handleSubmitGuess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question || !guess.trim()) return;

    try {
      const res = await api.submitGuess(question.sessionToken, guess.trim(), false, 5.0);
      setHistory(prev => [...prev, res.correct]);
      handleResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSkip = async () => {
    if (!question) return;
    try {
      const res = await api.submitGuess(question.sessionToken, '', true, 5.0);
      setHistory(prev => [...prev, false]);
      handleResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResult = (res: GuessResult) => {
    setResult(res);
    if (res.correct || res.roundEnded) {
      audioEngine.stop();
      setIsPlaying(false);
    }
    if (res.correct) {
      confetti({ particleCount: 90, spread: 80 });
    } else if (!res.roundEnded) {
      setQuestion(prev => prev ? {
        ...prev,
        currentStage: res.nextStage,
        currentDurationSeconds: res.nextDurationSeconds
      } : null);
    }
    setGuess('');
    setSuggestions([]);
  };

  const handleShare = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    let grid = '';
    for (let i = 0; i < 7; i++) {
      if (i < history.length) {
        grid += history[i] ? '🟩' : '⬛';
      } else {
        grid += '⬜';
      }
    }
    const scoreText = result?.correct
      ? `Solved in ${question?.currentDurationSeconds}s!`
      : 'X/7';
    const text = `SurGuess Daily #${dateStr}\n${grid}\n${scoreText}\nhttps://surguess.io`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-bollywood-gold border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-300 font-medium">Loading Today's Daily Bollywood Song...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 bg-bollywood-surface p-4 rounded-2xl border border-bollywood-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              {lang === 'hi' ? 'दैनिक बॉलीवुड पहेली' : 'Daily Challenge'}
            </span>
            <h2 className="text-base font-black text-white">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </h2>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-semibold uppercase">Daily Streak</span>
          <span className="text-lg font-black text-amber-400">🔥 1 Day</span>
        </div>
      </div>

      {/* Audio Exposure visualizer */}
      <div className="bg-gradient-to-b from-bollywood-surface to-slate-950 p-6 rounded-3xl border border-bollywood-border shadow-xl text-center mb-6">
        <AudioVisualizer isPlaying={isPlaying} />
        <button
          onClick={handlePlayAudio}
          disabled={isPlaying}
          className="mt-4 px-6 py-2.5 rounded-full bg-bollywood-gold text-slate-950 font-bold text-xs flex items-center gap-2 mx-auto hover:bg-amber-400 transition-colors"
        >
          {isPlaying ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Playing...' : `Play Snippet (${question.currentDurationSeconds}s)`}
        </button>
      </div>

      {/* Ladder */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {STAGES.map((s, idx) => {
          const isCurrent = idx + 1 === question.currentStage;
          const isDone = idx < history.length;
          return (
            <div
              key={s}
              className={`py-2 text-center rounded-lg text-xs font-bold ${
                isDone
                  ? history[idx] ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  : isCurrent
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                  : 'bg-slate-900 text-slate-600'
              }`}
            >
              {s}s
            </div>
          );
        })}
      </div>

      {!result?.roundEnded ? (
        <form onSubmit={handleSubmitGuess} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={guess}
              onChange={e => setGuess(e.target.value)}
              placeholder="Enter today's song..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm"
            />
            <button
              type="submit"
              disabled={!guess.trim()}
              className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-bollywood-gold text-slate-950 font-bold text-xs uppercase"
            >
              Guess
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-h-40 overflow-y-auto">
              {suggestions.map(s => (
                <div
                  key={s.id}
                  onClick={() => { setGuess(s.titleEn); setSuggestions([]); }}
                  className="px-3.5 py-2 hover:bg-slate-800 cursor-pointer text-xs text-slate-200 border-b border-slate-800 last:border-none"
                >
                  {s.titleEn} ({s.filmTitleEn})
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSkip}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5"
            >
              <SkipForward className="w-4 h-4 text-amber-400" />
              Skip (+More Audio)
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-bollywood-surface p-6 rounded-3xl border border-bollywood-border shadow-2xl text-center">
          <h3 className="text-2xl font-black text-white mb-1">
            {result.revealedSong?.titleEn}
          </h3>
          <p className="text-lg text-amber-400 font-hindi mb-2">
            {result.revealedSong?.titleHi}
          </p>
          <p className="text-xs text-slate-400 mb-6">
            From <strong>{result.revealedSong?.filmTitleEn} ({result.revealedSong?.releaseYear})</strong> • {result.revealedSong?.singers.join(', ')}
          </p>

          <button
            onClick={handleShare}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 shadow-xl transition-opacity"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied Shareable Result!' : 'Share Today’s Result'}
          </button>
        </div>
      )}
    </div>
  );
};
