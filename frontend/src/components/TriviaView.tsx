import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { TriviaItem } from '../types';

interface Props {
  lang: 'en' | 'hi';
}

export const TriviaView: React.FC<Props> = ({ lang }) => {
  const [questions, setQuestions] = useState<TriviaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadTrivia();
  }, []);

  const loadTrivia = async () => {
    setLoading(true);
    try {
      const data = await api.getTriviaQuestions();
      setQuestions(data);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setScore(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (option: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(option);

    const current = questions[currentIndex];
    if (option === current.correctAnswer) {
      setScore(prev => prev + 100);
      confetti({ particleCount: 50, spread: 60 });
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      loadTrivia();
    }
  };

  if (loading || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-bollywood-gold border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-300 font-medium">Gathering Bollywood Studio Anecdotes & Lore...</p>
      </div>
    );
  }

  const current = questions[currentIndex];
  const isCorrect = selectedAnswer === current.correctAnswer;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-bollywood-surface p-4 rounded-2xl border border-bollywood-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-bollywood-gold" />
          </div>
          <div>
            <span className="text-xs font-bold text-bollywood-gold uppercase tracking-wider">
              {lang === 'hi' ? 'रोचक तथ्य और किस्से' : 'Fun Facts & Stories'}
            </span>
            <h2 className="text-sm font-black text-white">Story {currentIndex + 1} of {questions.length}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-amber-500/30">
          <Trophy className="w-4 h-4 text-bollywood-gold" />
          <span className="text-base font-black text-amber-400">{score}</span>
        </div>
      </div>

      {/* Story Question Box */}
      <div className="bg-gradient-to-b from-bollywood-surface to-slate-950 p-6 rounded-3xl border border-bollywood-border shadow-xl mb-6">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          HINDI FILM MUSIC LORE
        </span>
        <p className="text-lg font-bold text-slate-100 leading-relaxed italic">
          "{current.explanation}"
        </p>
        <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-amber-400">
          Which famous Hindi song or soundtrack is associated with this story?
        </div>
      </div>

      {/* 4 Answer Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {current.options.map((opt, idx) => {
          let style = 'bg-slate-900 border-slate-700 hover:border-bollywood-gold text-white';
          if (selectedAnswer) {
            if (opt === current.correctAnswer) {
              style = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500';
            } else if (opt === selectedAnswer) {
              style = 'bg-rose-950/80 border-rose-500 text-rose-200';
            } else {
              style = 'bg-slate-950/60 border-slate-900 text-slate-500 opacity-50';
            }
          }

          return (
            <button
              key={idx}
              disabled={!!selectedAnswer}
              onClick={() => handleSelect(opt)}
              className={`p-4 rounded-2xl border text-left font-bold text-sm transition-all flex items-center justify-between ${style}`}
            >
              <span>{opt}</span>
              {selectedAnswer && opt === current.correctAnswer && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              )}
              {selectedAnswer && opt === selectedAnswer && !isCorrect && (
                <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Post-Answer Feedback */}
      {selectedAnswer && (
        <div className="bg-bollywood-surface p-6 rounded-3xl border border-bollywood-border shadow-2xl animate-fadeIn text-center">
          <div className="mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isCorrect ? '🎉 Correct! (+100 Pts)' : '❌ Incorrect!'}
            </span>
            <h3 className="text-xl font-black text-white mt-1">
              Song: {current.filmOrSong}
            </h3>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-xl bg-bollywood-gold text-slate-950 font-black text-sm uppercase tracking-wider hover:bg-amber-400 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>{currentIndex + 1 < questions.length ? 'Next Fun Fact' : 'Finish & Play Again'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
