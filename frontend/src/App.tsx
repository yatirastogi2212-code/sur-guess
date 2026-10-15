import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProgressiveGame } from './components/ProgressiveGame';
import { QuizGame } from './components/QuizGame';
import { DuoSquareCashGame } from './components/DuoSquareCashGame';
import { MultiplayerRoom } from './components/MultiplayerRoom';
import { DailyChallenge } from './components/DailyChallenge';
import { DecadesView } from './components/DecadesView';
import { ArtistsView } from './components/ArtistsView';
import { TriviaView } from './components/TriviaView';
import { AdminPanel } from './components/AdminPanel';
import { Music2, Heart, Shield } from 'lucide-react';
import { audioEngine } from './services/audioEngine';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  // As soon as user switches from one tab to another, kill previous song immediately!
  useEffect(() => {
    audioEngine.stop();
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-bollywood-bg text-slate-100 selection:bg-bollywood-gold selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && <Hero onNavigate={setActiveTab} lang={lang} />}
        {activeTab === 'progressive' && <ProgressiveGame lang={lang} />}
        {activeTab === 'quiz' && <QuizGame lang={lang} />}
        {activeTab === 'duo' && <DuoSquareCashGame lang={lang} />}
        {activeTab === 'multiplayer' && <MultiplayerRoom lang={lang} />}
        {activeTab === 'daily' && <DailyChallenge lang={lang} />}
        {activeTab === 'decades' && <DecadesView lang={lang} />}
        {activeTab === 'artists' && <ArtistsView lang={lang} />}
        {activeTab === 'trivia' && <TriviaView lang={lang} />}
        {activeTab === 'admin' && <AdminPanel />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-bollywood-gold to-bollywood-ruby flex items-center justify-center">
                <Music2 className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-black text-lg text-white">SurGuess</span>
                <span className="text-xs text-slate-400 block">
                  The Hindi & Bollywood Music Guessing Platform
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>
                Audio rights verified via <strong>Web Audio Procedural Synthesis</strong> & Open Metadata. Zero copyright scraping.
              </span>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-1">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
              <span>for Hindi Film Music lovers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
