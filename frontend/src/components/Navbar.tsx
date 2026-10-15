import React from 'react';
import {
  Music2,
  Users,
  Calendar,
  Sparkles,
  Disc3,
  Mic2,
  ShieldCheck,
  Zap,
  HelpCircle,
  Flame
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: 'en' | 'hi';
  setLang: (lang: 'en' | 'hi') => void;
}

export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab, lang, setLang }) => {
  return (
    <header className="sticky top-0 z-50 bg-bollywood-surface/90 backdrop-blur-md border-b border-bollywood-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-bollywood-gold via-bollywood-saffron to-bollywood-ruby flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Music2 className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-amber-400 via-orange-300 to-rose-400 bg-clip-text text-transparent">
                  SurGuess
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-bollywood-gold/20 text-bollywood-gold font-bold border border-bollywood-gold/30">
                  हिन्दी
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                {lang === 'hi' ? 'बॉलीवुड संगीत पहचान' : 'Bollywood Song Guesser'}
              </p>
            </div>
          </div>

          {/* Nav Links Desktop */}
          <nav className="hidden xl:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('progressive')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'progressive'
                  ? 'bg-bollywood-gold text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Zap className="w-4 h-4" />
              {lang === 'hi' ? 'शॉर्ट क्लिप गेस' : 'Progressive Audio'}
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'quiz'
                  ? 'bg-bollywood-gold text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              {lang === 'hi' ? 'क्विज़ (4 ऑप्शन्स)' : '4-Option Quiz'}
            </button>

            <button
              onClick={() => setActiveTab('duo')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'duo'
                  ? 'bg-bollywood-gold text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Flame className="w-4 h-4 text-orange-400" />
              {lang === 'hi' ? 'द्वंद्व / चौक / कैश' : 'Duo / Square / Cash'}
            </button>

            <button
              onClick={() => setActiveTab('multiplayer')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'multiplayer'
                  ? 'bg-bollywood-gold text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              {lang === 'hi' ? 'दोस्तों के साथ खेलें' : 'Play With Friends'}
            </button>

            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'daily'
                  ? 'bg-bollywood-gold text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calendar className="w-4 h-4 text-purple-400" />
              {lang === 'hi' ? 'दैनिक चुनौती' : 'Daily Challenge'}
            </button>

            <button
              onClick={() => setActiveTab('decades')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'decades'
                  ? 'bg-bollywood-gold text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Disc3 className="w-4 h-4" />
              {lang === 'hi' ? 'दशक' : 'Decades'}
            </button>

            <button
              onClick={() => setActiveTab('artists')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'artists'
                  ? 'bg-bollywood-gold text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Mic2 className="w-4 h-4" />
              {lang === 'hi' ? 'गायक' : 'Singers'}
            </button>

            <button
              onClick={() => setActiveTab('trivia')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'trivia'
                  ? 'bg-bollywood-gold text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              {lang === 'hi' ? 'रोचक तथ्य' : 'Fun Facts'}
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 transition-colors"
            >
              {lang === 'en' ? '🇮🇳 हिंदी' : '🌐 English'}
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              title="Admin & Audio Rights"
              className={`p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors ${
                activeTab === 'admin' ? 'bg-slate-800 text-bollywood-gold border-bollywood-gold/40' : ''
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="xl:hidden flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none border-t border-slate-800/80 text-xs font-medium">
          <button
            onClick={() => setActiveTab('progressive')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap ${
              activeTab === 'progressive' ? 'bg-bollywood-gold text-black font-bold' : 'bg-slate-900 text-slate-300'
            }`}
          >
            ⚡ Progressive Audio
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap ${
              activeTab === 'quiz' ? 'bg-bollywood-gold text-black font-bold' : 'bg-slate-900 text-slate-300'
            }`}
          >
            ❓ 4-Option Quiz
          </button>
          <button
            onClick={() => setActiveTab('duo')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap ${
              activeTab === 'duo' ? 'bg-bollywood-gold text-black font-bold' : 'bg-slate-900 text-slate-300'
            }`}
          >
            🔥 Duo / Square / Cash
          </button>
          <button
            onClick={() => setActiveTab('multiplayer')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap ${
              activeTab === 'multiplayer' ? 'bg-bollywood-gold text-black font-bold' : 'bg-slate-900 text-slate-300'
            }`}
          >
            👥 Play With Friends
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap ${
              activeTab === 'daily' ? 'bg-bollywood-gold text-black font-bold' : 'bg-slate-900 text-slate-300'
            }`}
          >
            📅 Daily
          </button>
          <button
            onClick={() => setActiveTab('decades')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap ${
              activeTab === 'decades' ? 'bg-bollywood-gold text-black font-bold' : 'bg-slate-900 text-slate-300'
            }`}
          >
            📻 Decades
          </button>
          <button
            onClick={() => setActiveTab('artists')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap ${
              activeTab === 'artists' ? 'bg-bollywood-gold text-black font-bold' : 'bg-slate-900 text-slate-300'
            }`}
          >
            🎤 Singers
          </button>
          <button
            onClick={() => setActiveTab('trivia')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap ${
              activeTab === 'trivia' ? 'bg-bollywood-gold text-black font-bold' : 'bg-slate-900 text-slate-300'
            }`}
          >
            ✨ Fun Facts
          </button>
        </div>
      </div>
    </header>
  );
};
