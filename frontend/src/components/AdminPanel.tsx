import React, { useState, useEffect } from 'react';
import { ShieldCheck, Play, Database, Check, AlertTriangle, Plus, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { audioEngine } from '../services/audioEngine';
import { SongDetail } from '../types';

interface AudioAssetItem {
  id: number;
  song: {
    id: number;
    titleEn: string;
    titleHi: string;
    signatureRiffNotes: string;
  };
  provider: string;
  rightsStatus: string;
  licenseType: string;
  attribution: string;
  sourceUrl?: string;
  durationMs: number;
  playable: boolean;
}

export const AdminPanel: React.FC = () => {
  const [assets, setAssets] = useState<AudioAssetItem[]>([]);
  const [songs, setSongs] = useState<SongDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [newAliasSongId, setNewAliasSongId] = useState<number>(1);
  const [newAliasText, setNewAliasText] = useState<string>('');
  const [aliasFeedback, setAliasFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    return () => audioEngine.stop();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assetList, songList] = await Promise.all([
        api.getAudioAssets(),
        api.getAllSongs()
      ]);
      setAssets(assetList);
      setSongs(songList);
      if (songList.length > 0) {
        setNewAliasSongId(songList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlayable = async (asset: AudioAssetItem) => {
    try {
      const updated = await api.updateAssetStatus(asset.id, asset.rightsStatus, !asset.playable, asset.attribution);
      setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, playable: updated.playable } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestAudio = (asset: AudioAssetItem) => {
    audioEngine.playClip(asset.song.signatureRiffNotes, asset.sourceUrl, 4.0);
  };

  const handleRunMusicBrainz = async () => {
    setImportStatus('Running MusicBrainz API v2 query for Indian Cinema recordings...');
    try {
      const rep = await api.importMusicBrainz('bollywood');
      setImportStatus(`Success: Processed ${rep.recordsProcessed} recordings under ${rep.license}. All mapped with PENDING_REVIEW.`);
    } catch (err) {
      setImportStatus('Import failed.');
    }
  };

  const handleRunWikidata = async () => {
    setImportStatus('Executing Wikidata SPARQL pipeline for Bollywood soundtracks...');
    try {
      const rep = await api.importWikidata('Q22931');
      setImportStatus(`Success: Processed ${rep.recordsProcessed} items. Mapped composer, lyricist, and release dates under CC0.`);
    } catch (err) {
      setImportStatus('Wikidata query failed.');
    }
  };

  const handleAddAlias = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAliasText.trim()) return;
    try {
      await api.addAlias(newAliasSongId, newAliasText.trim(), 'LATIN');
      setAliasFeedback(`Added alias "${newAliasText}" to song ID #${newAliasSongId}`);
      setNewAliasText('');
      setTimeout(() => setAliasFeedback(null), 3000);
    } catch (err) {
      setAliasFeedback('Failed to add alias');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-bollywood-gold text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>CONTENT QUALITY & RIGHTS MANAGEMENT</span>
          </div>
          <h2 className="text-2xl font-black text-white">Audio Rights & Ingestion Console</h2>
        </div>
        <button
          onClick={loadData}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Ingestion & Metadata Pipeline Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-bollywood-surface p-6 rounded-3xl border border-bollywood-border">
          <div className="flex items-center gap-2 mb-2 text-sm font-black text-white">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Repeatable Import Pipelines</span>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Ingest and normalize external Hindi music credits from authorized open data repositories without scraping or violating terms.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRunMusicBrainz}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-200 text-xs font-bold transition-colors"
            >
              Run MusicBrainz Pipeline (ODbL)
            </button>
            <button
              onClick={handleRunWikidata}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-blue-500 text-slate-200 text-xs font-bold transition-colors"
            >
              Run Wikidata SPARQL Pipeline (CC0)
            </button>
          </div>

          {importStatus && (
            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300">
              {importStatus}
            </div>
          )}
        </div>

        {/* Add Alias Workflow */}
        <div className="bg-bollywood-surface p-6 rounded-3xl border border-bollywood-border">
          <div className="flex items-center gap-2 mb-2 text-sm font-black text-white">
            <Plus className="w-4 h-4 text-bollywood-gold" />
            <span>Add Transliteration Alias</span>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Support colloquial transliterations or alternate spellings to enhance answer recognition.
          </p>

          <form onSubmit={handleAddAlias} className="space-y-3">
            <select
              value={newAliasSongId}
              onChange={e => setNewAliasSongId(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
            >
              {songs.map(s => (
                <option key={s.id} value={s.id}>
                  #{s.id}: {s.titleEn} ({s.filmTitleEn})
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="text"
                value={newAliasText}
                onChange={e => setNewAliasText(e.target.value)}
                placeholder="New alias (e.g. Tujhe Dekha Toh Yeh Jana)"
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
              />
              <button
                type="submit"
                disabled={!newAliasText.trim()}
                className="px-4 py-2 rounded-xl bg-bollywood-gold text-slate-950 font-bold text-xs"
              >
                Save
              </button>
            </div>
            {aliasFeedback && (
              <span className="text-xs text-emerald-400 font-semibold block">{aliasFeedback}</span>
            )}
          </form>
        </div>
      </div>

      {/* Audio Rights Table */}
      <div className="bg-bollywood-surface rounded-3xl border border-bollywood-border overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-black text-white text-base">Audio Assets & Licensing Registry</h3>
          <span className="text-xs text-slate-400 font-bold">{assets.length} Active Records</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading assets...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Song</th>
                  <th className="p-4">Provider</th>
                  <th className="p-4">Rights Status</th>
                  <th className="p-4">License Type</th>
                  <th className="p-4">Playable</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {assets.map(asset => (
                  <tr key={asset.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-bold text-white">
                      <div>{asset.song.titleEn}</div>
                      <div className="text-[11px] text-amber-400 font-hindi">{asset.song.titleHi}</div>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      {asset.provider}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        asset.rightsStatus === 'APPROVED_SYNTHETIC' || asset.rightsStatus === 'VERIFIED_PUBLIC_DOMAIN'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {asset.rightsStatus === 'APPROVED_SYNTHETIC' ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {asset.rightsStatus}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {asset.licenseType}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleTogglePlayable(asset)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-colors ${
                          asset.playable
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {asset.playable ? 'ACTIVE' : 'DISABLED'}
                      </button>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleTestAudio(asset)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                        title="Test Audio Playback"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
