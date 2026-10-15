import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Trophy, Play, CheckCircle2, RotateCcw } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { api } from '../services/api';
import { AudioVisualizer } from './AudioVisualizer';
import { QuizQuestion, GuessResult, SongAutocomplete } from '../types';

interface Props {
  lang: 'en' | 'hi';
}

type RiskChoice = 'DUO' | 'SQUARE' | 'CASH';

export const DuoSquareCashGame: React.FC<Props> = ({ lang }) => {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedRisk, setSelectedRisk] = useState<RiskChoice | null>(null);
  const [cashGuess, setCashGuess] = useState<string>('');
  const [suggestions, setSuggestions] = useState<SongAutocomplete[]>([]);
  const [result, setResult] = useState<GuessResult | null>(null);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    loadNewRound();
    return () => audioEngine.stop();
  }, []);

  const loadNewRound = async () => {
    setLoading(true);
    setResult(null);
    setSelectedRisk(null);
    setCashGuess('');
    try {
      const q = await api.startQuiz('DUO_SQUARE_CASH', undefined, undefined, 5);
      setQuestion(q);
      setTimeout(() => {
        setIsPlaying(true);
        audioEngine.playClip(q.signatureRiffNotes, q.previewUrl || q.sourceUrl, 15.0, q.snippetStartOffset || 5.0, () => setIsPlaying(false));
      }, 300);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (cashGuess.trim().length >= 2) {
        const matches = await api.autocomplete(cashGuess);
        setSuggestions(matches);
      } else {
        setSuggestions([]);
      }
    };
    const t = setTimeout(fetchSuggestions, 150);
    return () => clearTimeout(t);
  }, [cashGuess]);

  const handleChooseRisk = (risk: RiskChoice) => {
    setSelectedRisk(risk);
  };

  const handleSubmitOption = async (option: string) => {
    if (!question || !selectedRisk) return;
    audioEngine.stop();
    setIsPlaying(false);
    try {
      const res = await api.submitGuess(question.sessionToken, option, false, 5.0, selectedRisk);
      setResult(res);
      setScore(res.currentTotalScore);
      if (res.correct) confetti({ particleCount: 70, spread: 70 });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitCash = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question || !cashGuess.trim()) return;
    audioEngine.stop();
    setIsPlaying(false);
    try {
      const res = await api.submitGuess(question.sessionToken, cashGuess.trim(), false, 5.0, 'CASH');
      setResult(res);
      setScore(res.currentTotalScore);
      if (res.correct) confetti({ particleCount: 100, spread: 80 });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-bollywood-gold border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-300 font-medium">Preparing Risk Game Round...</p>
      </div>
    );
  }

  // If Duo chosen: only show 2 options
  const optionsToDisplay = selectedRisk === 'DUO'
    ? question.options?.slice(0, 2)
    : question.options;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-bollywood-surface p-4 rounded-2xl border border-bollywood-border">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              {lang === 'hi' ? 'जोखिम और इनाम मोड' : 'Risk & Reward Mode'}
            </span>
            <h2 className="text-lg font-black text-white">Duo, Chauk (Square), or Cash</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-amber-500/30">
          <Trophy className="w-4 h-4 text-bollywood-gold" />
          <span className="text-base font-black text-amber-400">{score}</span>
        </div>
      </div>

      {/* Audio Visualizer */}
      <div className="bg-gradient-to-b from-bollywood-surface to-slate-950 p-6 rounded-3xl border border-bollywood-border shadow-xl mb-6 text-center">
        <AudioVisualizer isPlaying={isPlaying} />
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setIsPlaying(true);
              audioEngine.playClip(question.signatureRiffNotes, question.previewUrl || question.sourceUrl, 15.0, question.snippetStartOffset || 5.0, () => setIsPlaying(false));
            }}
            className="px-4 py-2 rounded-xl bg-bollywood-gold text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-colors"
          >
            {isPlaying ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Playing...' : 'Replay Clip'}
          </button>
        </div>
      </div>

      {/* Risk Selection Tier */}
      {!selectedRisk && !result && (
        <div className="bg-bollywood-surface p-6 rounded-3xl border border-bollywood-border shadow-2xl mb-6 text-center">
          <h3 className="text-lg font-black text-white mb-2">
            {lang === 'hi' ? 'अपना रिस्क लेवल चुनें' : 'Choose Your Risk Level Before Answering'}
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Higher risk yields higher points. One wrong answer yields 0 points!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleChooseRisk('DUO')}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-emerald-500 hover:bg-slate-800 text-left transition-all group"
            >
              <div className="text-emerald-400 font-black text-lg mb-1 group-hover:scale-105 transition-transform">+100 Pts</div>
              <div className="text-white font-bold text-sm">DUO (2 Options)</div>
              <div className="text-xs text-slate-400 mt-1">Lowest risk: 50% chance between 2 songs.</div>
            </button>

            <button
              onClick={() => handleChooseRisk('SQUARE')}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-amber-500 hover:bg-slate-800 text-left transition-all group"
            >
              <div className="text-amber-400 font-black text-lg mb-1 group-hover:scale-105 transition-transform">+300 Pts</div>
              <div className="text-white font-bold text-sm">CHAUK (4 Options)</div>
              <div className="text-xs text-slate-400 mt-1">Medium risk: Standard 4 multiple-choice.</div>
            </button>

            <button
              onClick={() => handleChooseRisk('CASH')}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-rose-500 hover:bg-slate-800 text-left transition-all group"
            >
              <div className="text-rose-400 font-black text-lg mb-1 group-hover:scale-105 transition-transform">+500 Pts</div>
              <div className="text-white font-bold text-sm">CASH (Direct Guess)</div>
              <div className="text-xs text-slate-400 mt-1">Maximum risk: Zero options, direct text match!</div>
            </button>
          </div>
        </div>
      )}

      {/* Answer Mode based on risk */}
      {selectedRisk && !result && (
        <div className="bg-bollywood-surface p-6 rounded-3xl border border-bollywood-border shadow-2xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-bollywood-gold uppercase">
              Active Tier: <strong>{selectedRisk}</strong>
            </span>
            <button
              onClick={() => setSelectedRisk(null)}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Change Tier
            </button>
          </div>

          {selectedRisk === 'CASH' ? (
            <form onSubmit={handleSubmitCash} className="space-y-3">
              <input
                type="text"
                value={cashGuess}
                onChange={e => setCashGuess(e.target.value)}
                placeholder="Type exact song title (e.g. Tujhe Dekha Toh)..."
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
              />
              {suggestions.length > 0 && (
                <div className="bg-slate-900 border border-slate-700 rounded-xl max-h-48 overflow-y-auto">
                  {suggestions.map(s => (
                    <div
                      key={s.id}
                      onClick={() => setCashGuess(s.titleEn)}
                      className="px-3.5 py-2 hover:bg-slate-800 cursor-pointer text-xs text-slate-200 border-b border-slate-800 last:border-none"
                    >
                      {s.titleEn} ({s.filmTitleEn})
                    </div>
                  ))}
                </div>
              )}
              <button
                type="submit"
                disabled={!cashGuess.trim()}
                className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-sm uppercase transition-colors"
              >
                Lock In Cash Guess (+500 Pts)
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {optionsToDisplay?.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubmitOption(opt)}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-bollywood-gold hover:bg-slate-800 text-left font-bold text-sm text-white transition-all flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded bg-slate-800 text-xs flex items-center justify-center text-slate-400">
                    {idx + 1}
                  </span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="bg-bollywood-surface p-6 rounded-3xl border border-bollywood-border shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${result.correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.feedbackMessage}
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                {result.revealedSong?.titleEn} ({result.revealedSong?.filmTitleEn})
              </h3>
            </div>
            <span className="text-2xl font-black text-emerald-400">+{result.pointsAwarded}</span>
          </div>

          <button
            onClick={loadNewRound}
            className="w-full py-3.5 rounded-xl bg-bollywood-gold text-slate-950 font-black text-sm uppercase tracking-wider hover:bg-amber-400 transition-colors"
          >
            Play Next Round ➔
          </button>
        </div>
      )}
    </div>
  );
};
