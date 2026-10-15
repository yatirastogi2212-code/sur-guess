import React, { useState, useEffect } from 'react';
import { Mic2, Play, Award, Music, Search, Flame, Crown, Sparkles, X } from 'lucide-react';
import { api } from '../services/api';
import { Artist } from '../types';
import { QuizGame } from './QuizGame';
import { audioEngine } from '../services/audioEngine';

interface Props {
  lang: 'en' | 'hi';
}

export const ArtistsView: React.FC<Props> = ({ lang }) => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  useEffect(() => {
    api.getAllArtists().then(res => {
      setArtists(res);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (selectedArtist) {
    return (
      <div>
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <button
            onClick={() => {
              audioEngine.stop();
              setSelectedArtist(null);
            }}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 mb-2"
          >
            ← Back to All Artists
          </button>
        </div>
        <QuizGame categoryType="artist" categoryValue={String(selectedArtist.id)} lang={lang} />
      </div>
    );
  }

  const isModernArtist = (a: Artist) => {
    const era = (a.activeEra || '').toLowerCase();
    return era.includes('2020s') || era.includes('2010s') || a.debutYear >= 2008;
  };

  const modernCount = artists.filter(isModernArtist).length;
  const evergreenCount = artists.filter(a => !isModernArtist(a)).length;

  const filteredArtists = artists.filter(a => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (a.nameEn || '').toLowerCase().includes(q) ||
                        (a.nameHi || '').toLowerCase().includes(q) ||
                        (a.bio || '').toLowerCase().includes(q);
      if (!matchName) return false;
    }

    if (filterType === 'MODERN') return isModernArtist(a);
    if (filterType === 'EVERGREEN') return !isModernArtist(a);
    if (filterType === 'SINGER') return a.type === 'SINGER';
    if (filterType === 'COMPOSER') return a.type === 'COMPOSER';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bollywood-gold/10 border border-bollywood-gold/30 text-bollywood-gold text-xs font-bold mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>HINDI & BOLLYWOOD MUSIC CATALOGUE</span>
        </div>
        <h2 className="text-3xl font-black text-white">
          {lang === 'hi' ? 'गायक और संगीत निर्देशक' : 'Playback Singers & Modern Hitmakers'}
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          From contemporary reel sensations like Badshah, Diljit Dosanjh, Karan Aujla, and King to immortal golden-era legends.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mt-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Badshah, Diljit, Aujla, King, Arijit, Shreya..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-bollywood-gold focus:ring-1 focus:ring-bollywood-gold"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              filterType === 'ALL'
                ? 'bg-bollywood-gold text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            All Artists ({artists.length})
          </button>
          <button
            onClick={() => setFilterType('MODERN')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'MODERN'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black shadow-md shadow-orange-500/20'
                : 'bg-slate-900 border border-orange-500/30 text-orange-400 hover:text-orange-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Modern & Viral Stars ({modernCount})
          </button>
          <button
            onClick={() => setFilterType('EVERGREEN')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'EVERGREEN'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            Evergreen Legends ({evergreenCount})
          </button>
          <button
            onClick={() => setFilterType('SINGER')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'SINGER'
                ? 'bg-bollywood-gold text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            Playback Singers
          </button>
          <button
            onClick={() => setFilterType('COMPOSER')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'COMPOSER'
                ? 'bg-bollywood-gold text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            Music Directors
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-bollywood-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredArtists.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-sm">No artists found matching "{searchQuery}".</p>
          <button
            onClick={() => { setSearchQuery(''); setFilterType('ALL'); }}
            className="mt-3 text-xs text-bollywood-gold underline font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArtists.map(artist => {
            const isModern = isModernArtist(artist);
            return (
              <div
                key={artist.id}
                className={`bg-bollywood-surface border rounded-3xl p-5 shadow-xl flex flex-col justify-between group transition-all ${
                  isModern
                    ? 'border-orange-500/30 hover:border-orange-400/80 hover:shadow-orange-500/10'
                    : 'border-bollywood-border/80 hover:border-bollywood-gold/60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold ${
                      isModern
                        ? 'bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border-orange-500/40 text-orange-400'
                        : 'bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400'
                    }`}>
                      {artist.type === 'COMPOSER' ? <Music className="w-6 h-6" /> : <Mic2 className="w-6 h-6" />}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {isModern ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-950/60 border border-orange-500/40 text-orange-300 font-bold flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
                          Modern Star
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-amber-500/30 text-amber-300/80 font-bold flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-400" />
                          Evergreen
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-bold">
                        {artist.activeEra}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                    {artist.nameEn}
                  </h3>
                  <h4 className="text-sm font-hindi text-amber-400/90 mb-2">
                    {artist.nameHi}
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {artist.bio}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-semibold">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    Debut: {artist.debutYear}
                  </span>
                  <button
                    onClick={() => setSelectedArtist(artist)}
                    className="px-3.5 py-1.5 rounded-xl bg-bollywood-gold text-slate-950 font-bold text-xs flex items-center gap-1 hover:bg-amber-400 transition-colors shadow-sm"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Play Quiz
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
