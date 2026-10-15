import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Play, Square, Timer, Trophy, CheckCircle2, XCircle, RotateCcw, ArrowRight, Award } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { api } from '../services/api';
import { AudioVisualizer } from './AudioVisualizer';
import { QuizQuestion, GuessResult } from '../types';

interface Props {
  categoryType?: string;
  categoryValue?: string;
  lang: 'en' | 'hi';
}

export const QuizGame: React.FC<Props> = ({ categoryType, categoryValue, lang }) => {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<GuessResult | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [elapsed, setElapsed] = useState<number>(0);
  const [matchOver, setMatchOver] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(0);

  const countdownRef = useRef<number | null>(null);
  const autoPlayTimerRef = useRef<number | null>(null);

  // Stop audio whenever component mounts/unmounts or category changes
  useEffect(() => {
    loadNewQuiz();
    const unsub = audioEngine.subscribeStop(() => {
      setIsPlaying(false);
    });

    return () => {
      unsub();
      clearAllTimers();
      audioEngine.stop();
      setIsPlaying(false);
    };
  }, [categoryType, categoryValue]);

  const clearAllTimers = () => {
    if (countdownRef.current !== null) {
      window.clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (autoPlayTimerRef.current !== null) {
      window.clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  };

  const loadNewQuiz = async () => {
    clearAllTimers();
    audioEngine.stop();
    setIsPlaying(false);

    setLoading(true);
    setResult(null);
    setSelectedOption(null);
    setMatchOver(false);
    setCorrectCount(0);
    setTotalScore(0);

    try {
      const q = await api.startQuiz('STANDARD_QUIZ', categoryType, categoryValue, 10);
      setQuestion(q);
      startCountdown();

      // Cancelable auto-play after slight transition delay
      autoPlayTimerRef.current = window.setTimeout(() => {
        setIsPlaying(true);
        audioEngine.playClip(
          q.signatureRiffNotes,
          q.previewUrl || q.sourceUrl,
          15.0,
          q.snippetStartOffset || 5.0,
          () => setIsPlaying(false)
        );
      }, 250);
    } catch (err) {
      console.error("Failed to start quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    if (countdownRef.current !== null) {
      window.clearInterval(countdownRef.current);
    }
    setTimeLeft(15);
    setElapsed(0);

    countdownRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (countdownRef.current !== null) {
            window.clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
      setElapsed(prev => prev + 1);
    }, 1000);
  };

  // As soon as time is up: stop the song immediately!
  const handleTimeOut = async () => {
    if (!question || selectedOption || result) return;

    // 1. Immediately kill the song and cancel any pending auto-play
    audioEngine.stop();
    setIsPlaying(false);
    clearAllTimers();

    try {
      const res = await api.submitGuess(question.sessionToken, '__TIMEOUT__', false, 15.0);
      setResult(res);
      setTotalScore(res.currentTotalScore);
      if (res.gameEnded) {
        setMatchOver(true);
      }
    } catch (err) {
      console.error("Error submitting timeout guess:", err);
    }
  };

  // As soon as user selects an option: stop the song immediately!
  const handleSelectOption = async (option: string) => {
    if (selectedOption || result || !question) return;

    // 1. Immediately kill the song and cancel timers
    audioEngine.stop();
    setIsPlaying(false);
    clearAllTimers();

    setSelectedOption(option);

    try {
      const res = await api.submitGuess(question.sessionToken, option, false, elapsed);
      setResult(res);
      setTotalScore(res.currentTotalScore);

      if (res.correct) {
        setCorrectCount(prev => prev + 1);
        confetti({ particleCount: 60, spread: 60 });
      }

      if (res.gameEnded) {
        setMatchOver(true);
      }
    } catch (err) {
      console.error("Error submitting guess:", err);
    }
  };

  // Move to next question in the 10-question match
  const handleNext = async () => {
    // 1. Immediately kill any audio before starting next question
    audioEngine.stop();
    setIsPlaying(false);
    clearAllTimers();

    if (!question || (result && result.gameEnded)) {
      loadNewQuiz();
      return;
    }

    setLoading(true);
    setResult(null);
    setSelectedOption(null);

    try {
      const nextQ = await api.getCurrentQuestion(question.sessionToken);
      setQuestion(nextQ);
      startCountdown();

      // Auto-play next question snippet
      autoPlayTimerRef.current = window.setTimeout(() => {
        setIsPlaying(true);
        audioEngine.playClip(
          nextQ.signatureRiffNotes,
          nextQ.previewUrl || nextQ.sourceUrl,
          15.0,
          nextQ.snippetStartOffset || 5.0,
          () => setIsPlaying(false)
        );
      }, 250);
    } catch (err) {
      console.warn("Could not get next question in session, restarting:", err);
      loadNewQuiz();
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlay = () => {
    if (!question) return;
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      audioEngine.playClip(
        question.signatureRiffNotes,
        question.previewUrl || question.sourceUrl,
        15.0,
        question.snippetStartOffset || 5.0,
        () => setIsPlaying(false)
      );
    }
  };

  if (loading || !question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-bollywood-gold border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-300 font-medium">Setting up 10-Question Bollywood Audio Quiz...</p>
      </div>
    );
  }

  // Final Match Summary Card when all 10 questions finish
  if (matchOver && result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center animate-fadeIn">
        <div className="bg-bollywood-surface p-8 rounded-3xl border border-bollywood-gold/40 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Award className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold text-bollywood-gold uppercase tracking-wider">
            MATCH COMPLETED
          </span>
          <h2 className="text-3xl font-black text-white mt-1">Bollywood Master Quiz</h2>

          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">Total Score</span>
              <span className="text-2xl font-black text-amber-400">{totalScore}</span>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">Correct Answers</span>
              <span className="text-2xl font-black text-emerald-400">{correctCount} / {question.totalQuestions}</span>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-6">
            {correctCount >= 8
              ? '🌟 Sangeet Samrat! Exceptional ear for Bollywood hooks!'
              : correctCount >= 5
              ? '👏 Great game! You really know your Hindi soundtrack melodies.'
              : '🎵 Keep listening! Try another decade or artist quiz to hone your ear.'}
          </p>

          <button
            onClick={loadNewQuiz}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Play Another Match
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Quiz Header */}
      <div className="flex items-center justify-between mb-6 bg-bollywood-surface p-4 rounded-2xl border border-bollywood-border">
        <div>
          <span className="text-xs font-bold text-bollywood-gold uppercase tracking-wider">
            {categoryValue ? `${categoryValue.toUpperCase()} QUIZ` : 'BOLLYWOOD AUDIO QUIZ'}
          </span>
          <h2 className="text-xl font-black text-white">Question {question.questionNumber} of {question.totalQuestions}</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
            <Timer className={`w-4 h-4 ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`} />
            <span className={`text-base font-black ${timeLeft <= 5 ? 'text-rose-500' : 'text-white'}`}>{timeLeft}s</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-amber-500/30">
            <Trophy className="w-4 h-4 text-bollywood-gold" />
            <span className="text-base font-black text-amber-400">{totalScore}</span>
          </div>
        </div>
      </div>

      {/* Audio Play Visualizer */}
      <div className="bg-gradient-to-b from-bollywood-surface to-slate-950 p-6 rounded-3xl border border-bollywood-border shadow-xl mb-6 text-center">
        <AudioVisualizer isPlaying={isPlaying} />
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={handleTogglePlay}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors ${
              isPlaying
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-bollywood-gold text-slate-950 hover:bg-amber-400'
            }`}
          >
            {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isPlaying ? 'Stop Clip' : 'Replay Clip'}
          </button>
        </div>
      </div>

      {/* 4 Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {question.options?.map((option, idx) => {
          const isSelected = selectedOption === option;
          let btnStyle = 'bg-slate-900/90 border-slate-700 hover:border-bollywood-gold hover:bg-slate-800 text-white';

          if (result) {
            const isCorrect = result.revealedSong?.titleEn === option;
            if (isCorrect) {
              btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500';
            } else if (isSelected && !result.correct) {
              btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
            } else {
              btnStyle = 'bg-slate-950/50 border-slate-900 text-slate-500 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              disabled={!!result}
              onClick={() => handleSelectOption(option)}
              className={`p-4 rounded-2xl border text-left font-bold text-sm transition-all flex items-center justify-between ${btnStyle}`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-slate-800 text-xs flex items-center justify-center font-black text-slate-400">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{option}</span>
              </div>
              {result && result.revealedSong?.titleEn === option && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              )}
              {result && isSelected && !result.correct && (
                <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Result feedback */}
      {result && (
        <div className="bg-bollywood-surface p-6 rounded-3xl border border-bollywood-border shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${result.correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.correct ? '🎉 Correct Answer!' : '❌ Time Up or Incorrect!'}
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">
                {result.revealedSong?.titleEn} ({result.revealedSong?.filmTitleEn})
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Singers: <strong className="text-slate-200">{result.revealedSong?.singers.join(', ')}</strong>
              </p>
            </div>
            <span className="text-xl font-black text-emerald-400">+{result.pointsAwarded} pts</span>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-xl bg-bollywood-gold text-slate-950 font-black text-sm uppercase tracking-wider hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
          >
            {result.gameEnded ? 'Finish Match & Review' : 'Next Question'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
