import React from 'react';
import {
  Play,
  Users,
  Calendar,
  Flame,
  HelpCircle,
  Disc3,
  Mic2,
  Sparkles,
  Zap,
  Radio
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string) => void;
  lang: 'en' | 'hi';
}

export const Hero: React.FC<Props> = ({ onNavigate, lang }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Cinematic Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-bollywood-surface via-slate-900 to-slate-950 border border-bollywood-border p-8 sm:p-12 shadow-2xl mb-12">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bollywood-gold/20 border border-bollywood-gold/40 text-bollywood-gold text-xs font-black uppercase tracking-wider mb-4">
            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>{lang === 'hi' ? 'भारतीय सिनेमा संगीत पहचान मंच' : 'Hindi & Bollywood Music Guessing'}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            {lang === 'hi' ? (
              <>
                सिर्फ <span className="text-bollywood-gold font-hindi">0.1 सेकंड</span> सुनकर गाना पहचानें!
              </>
            ) : (
              <>
                Name that Bollywood tune in just{' '}
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                  0.1 seconds!
                </span>
              </>
            )}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            {lang === 'hi'
              ? 'अल्ट्रा-शॉर्ट ऑडियो पहचान खेलें। पहले 0.1 सेकंड की धुन सुनें। नहीं पहचान पाए? तो स्किप करके थोड़ी लंबी धुन अनलॉक करें। दोस्तों के साथ पार्टी रूम में लाइव मुकाबला करें!'
              : 'Listen to an ultra-brief 0.1-second audio snippet. Recognize the iconic hook? Guess in Romanized or Hindi script! Stumped? Reveal longer portions. Play solo, battle friends in real-time rooms, or solve the Daily Bollywood Heardle.'}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('progressive')}
              className="px-6 py-4 rounded-2xl bg-gradient-to-r from-bollywood-gold to-bollywood-saffron text-slate-950 font-black text-sm uppercase tracking-wider hover:opacity-95 shadow-xl shadow-amber-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>{lang === 'hi' ? 'शॉर्ट ऑडियो खेलें (Play 0.1s)' : 'Play 0.1s Audio Game'}</span>
            </button>

            <button
              onClick={() => onNavigate('multiplayer')}
              className="px-6 py-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-bold text-sm border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <Users className="w-5 h-5 text-emerald-400" />
              <span>{lang === 'hi' ? 'दोस्तों के साथ रूम' : 'Play With Friends'}</span>
            </button>

            <button
              onClick={() => onNavigate('daily')}
              className="px-5 py-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-white font-bold text-sm flex items-center gap-2 transition-colors"
            >
              <Calendar className="w-5 h-5 text-purple-400" />
              <span>{lang === 'hi' ? 'दैनिक चुनौती' : 'Daily Challenge'}</span>
            </button>
          </div>
        </div>

        {/* Cinematic Background Accents */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none bg-gradient-to-l from-amber-500 via-rose-500 to-transparent" />
        <div className="absolute -right-10 -bottom-10 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Featured Game Modes Grid */}
      <div className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white">
              {lang === 'hi' ? 'गेम मोड्स' : 'Game Modes & Formats'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your favorite way to challenge your ear and Bollywood memory
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Progressive */}
          <div
            onClick={() => onNavigate('progressive')}
            className="p-6 rounded-3xl bg-bollywood-surface border border-bollywood-border/80 hover:border-bollywood-gold cursor-pointer transition-all hover:-translate-y-1 group shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-white group-hover:text-amber-400 transition-colors">
              Progressive Reveal
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Start with 0.1s. Each skip unlocks 0.5s, 1s, 2s up to 15s. Guess in shortest audio for max points.
            </p>
            <span className="mt-4 text-xs font-bold text-bollywood-gold flex items-center gap-1">
              Play Now ➔
            </span>
          </div>

          {/* Card 2: 4-Option Quiz */}
          <div
            onClick={() => onNavigate('quiz')}
            className="p-6 rounded-3xl bg-bollywood-surface border border-bollywood-border/80 hover:border-bollywood-gold cursor-pointer transition-all hover:-translate-y-1 group shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-white group-hover:text-blue-400 transition-colors">
              4-Option Audio Quiz
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              The classic SongTrivia experience: 10 audio questions, 4 Bollywood options, and 15 seconds per round.
            </p>
            <span className="mt-4 text-xs font-bold text-blue-400 flex items-center gap-1">
              Play Quiz ➔
            </span>
          </div>

          {/* Card 3: Duo, Square, Cash */}
          <div
            onClick={() => onNavigate('duo')}
            className="p-6 rounded-3xl bg-bollywood-surface border border-bollywood-border/80 hover:border-orange-500 cursor-pointer transition-all hover:-translate-y-1 group shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-white group-hover:text-orange-400 transition-colors">
              Duo / Square / Cash
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Pick your risk! Duo (2 options / 100 pts), Square (4 options / 300 pts), or Cash (direct guess / 500 pts).
            </p>
            <span className="mt-4 text-xs font-bold text-orange-400 flex items-center gap-1">
              Try Risk Mode ➔
            </span>
          </div>

          {/* Card 4: Multiplayer */}
          <div
            onClick={() => onNavigate('multiplayer')}
            className="p-6 rounded-3xl bg-bollywood-surface border border-bollywood-border/80 hover:border-emerald-500 cursor-pointer transition-all hover:-translate-y-1 group shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-white group-hover:text-emerald-400 transition-colors">
              Play With Friends
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Real-time private rooms with 6-char codes. Synchronized snippets, live leaderboard, cheer emojis & rematch!
            </p>
            <span className="mt-4 text-xs font-bold text-emerald-400 flex items-center gap-1">
              Create Party ➔
            </span>
          </div>
        </div>
      </div>

      {/* Explore Categories: Decades, Artists, Fun Facts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => onNavigate('decades')}
          className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-bollywood-surface border border-slate-800 hover:border-slate-700 cursor-pointer group"
        >
          <div className="flex items-center gap-3 mb-3">
            <Disc3 className="w-6 h-6 text-amber-400" />
            <h4 className="font-black text-lg text-white">8 Eras of Hindi Cinema</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Explore 1950s Golden Era, 1970s Pancham & Kishore revolution, 90s Romance, to 2020s streaming chartbusters.
          </p>
          <span className="text-xs font-bold text-amber-400 group-hover:underline">Explore Decades ➔</span>
        </div>

        <div
          onClick={() => onNavigate('artists')}
          className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-bollywood-surface border border-slate-800 hover:border-slate-700 cursor-pointer group"
        >
          <div className="flex items-center gap-3 mb-3">
            <Mic2 className="w-6 h-6 text-purple-400" />
            <h4 className="font-black text-lg text-white">Legendary Playback Voices</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Lata, Kishore, Rafi, Asha, Mukesh, Sanu, Alka, Sonu, KK, Shreya, Arijit, and master music directors.
          </p>
          <span className="text-xs font-bold text-purple-400 group-hover:underline">Explore Artists ➔</span>
        </div>

        <div
          onClick={() => onNavigate('trivia')}
          className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-bollywood-surface border border-slate-800 hover:border-slate-700 cursor-pointer group"
        >
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <h4 className="font-black text-lg text-white">Studio Lore & Fun Facts</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Did you know Lata recorded in Mohan Studios bathroom for reverb, or Pancham clinked spoons on soda bottles?
          </p>
          <span className="text-xs font-bold text-emerald-400 group-hover:underline">Play Trivia Stories ➔</span>
        </div>
      </div>
    </div>
  );
};
