import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Users,
  Copy,
  Check,
  Play,
  RotateCcw,
  SkipForward,
  Trophy,
  Crown,
  Search,
  MessageSquare
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { api } from '../services/api';
import { AudioVisualizer } from './AudioVisualizer';
import { RoomState, SongAutocomplete } from '../types';

interface Props {
  lang: 'en' | 'hi';
}

export const MultiplayerRoom: React.FC<Props> = ({ lang }) => {
  const [playerId] = useState<string>(() => 'player-' + Math.random().toString(36).substring(2, 9));
  const [nickname, setNickname] = useState<string>(() => 'Ustaad_' + Math.floor(Math.random() * 900 + 100));
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');
  const [room, setRoom] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [guess, setGuess] = useState<string>('');
  const [suggestions, setSuggestions] = useState<SongAutocomplete[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([]);
  const [chatInput, setChatInput] = useState<string>('');

  // Auto-polling for room updates every 1.5 seconds if active
  useEffect(() => {
    let pollInterval: number;
    if (room && room.status !== 'CLOSED') {
      pollInterval = window.setInterval(async () => {
        try {
          const updated = await api.getRoom(room.roomCode);
          setRoom(updated);
        } catch (_) {}
      }, 1500);
    }
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [room?.roomCode, room?.status]);

  const handleCreateRoom = async () => {
    if (!nickname.trim()) return;
    setLoading(true);
    try {
      const state = await api.createRoom(playerId, nickname.trim(), 'PROGRESSIVE', 5);
      setRoom(state);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCodeInput.trim() || !nickname.trim()) return;
    setLoading(true);
    try {
      const state = await api.joinRoom(roomCodeInput.trim(), playerId, nickname.trim());
      setRoom(state);
    } catch (err) {
      alert('Room not found or failed to join: ' + roomCodeInput);
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!room) return;
    try {
      const state = await api.startRoomGame(room.roomCode, playerId);
      setRoom(state);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlayAudio = () => {
    if (!room) return;
    setIsPlaying(true);
    const audioUrl = room.previewUrl || room.sourceUrl;
    audioEngine.playClip(
      room.signatureRiffNotes,
      audioUrl,
      room.currentDurationSeconds,
      room.snippetStartOffset || 5.0,
      () => setIsPlaying(false)
    );
  };

  // Autocomplete
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

  const handleSubmitGuess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!room || !guess.trim()) return;
    try {
      const state = await api.submitRoomGuess(room.roomCode, playerId, guess.trim(), 4.0);
      setRoom(state);
      setGuess('');
      setSuggestions([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdvanceStage = async (skipStage: boolean) => {
    if (!room) return;
    try {
      const state = await api.advanceRoom(room.roomCode, playerId, skipStage);
      setRoom(state);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmoji = (emoji: string) => {
    setChatMessages(prev => [...prev, { sender: nickname, text: emoji }]);
    confetti({ particleCount: 30, spread: 50 });
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { sender: nickname, text: chatInput.trim() }]);
    setChatInput('');
  };

  const isHost = room?.hostPlayerId === playerId;

  // LOBBY SETUP VIEW
  if (!room) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-bollywood-surface p-8 rounded-3xl border border-bollywood-border shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
            <Users className="w-8 h-8 text-slate-950" />
          </div>

          <h2 className="text-2xl font-black text-white mb-2">
            {lang === 'hi' ? 'दोस्तों के साथ खेलें' : 'Play With Friends'}
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Create a private party room, share the code, and compete live on the same Bollywood audio tracks.
          </p>

          <div className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {lang === 'hi' ? 'आपका उपनाम (Nickname)' : 'Your Nickname'}
              </label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="e.g. KishoreFan_99"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-bollywood-gold"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleCreateRoom}
                disabled={loading || !nickname.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider hover:opacity-95 transition-opacity shadow-lg shadow-emerald-500/20"
              >
                {loading ? 'Creating Room...' : '+ Create Private Room'}
              </button>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800" />
              <span className="flex-shrink mx-4 text-xs text-slate-500 uppercase font-bold">OR JOIN ROOM</span>
              <div className="flex-grow border-t border-slate-800" />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={roomCodeInput}
                onChange={e => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="Enter 6-char code"
                maxLength={8}
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm uppercase tracking-wider font-mono focus:outline-none focus:border-bollywood-gold"
              />
              <button
                onClick={handleJoinRoom}
                disabled={loading || !roomCodeInput.trim()}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 font-bold text-sm transition-colors"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE ROOM LOBBY / PLAYING VIEW
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Room Banner */}
      <div className="bg-bollywood-surface p-4 rounded-2xl border border-bollywood-border mb-6 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase block">ROOM CODE</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono font-black text-2xl text-emerald-400 tracking-wider">
              {room.roomCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Copy Room Code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold uppercase block">PLAYERS</span>
            <span className="text-xl font-black text-white">{room.players.length}</span>
          </div>

          <button
            onClick={() => api.leaveRoom(room.roomCode, playerId).then(() => setRoom(null))}
            className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/10 transition-colors"
          >
            Leave
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Game Stage */}
        <div className="lg:col-span-2">
          {room.status === 'LOBBY' ? (
            <div className="bg-bollywood-surface p-8 rounded-3xl border border-bollywood-border text-center">
              <h3 className="text-xl font-black text-white mb-2">Party Lobby</h3>
              <p className="text-xs text-slate-400 mb-6">
                Waiting for players to join... When ready, the host can start the synchronized match!
              </p>

              {isHost ? (
                <button
                  onClick={handleStartGame}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-bollywood-gold to-bollywood-saffron text-slate-950 font-black text-base uppercase tracking-wider hover:opacity-95 shadow-xl transition-all"
                >
                  Start Multiplayer Match ➔
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-sm animate-pulse">
                  Waiting for host to start the game...
                </div>
              )}
            </div>
          ) : (
            <div className="bg-bollywood-surface p-6 rounded-3xl border border-bollywood-border shadow-xl">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-bollywood-gold uppercase">
                  SONG {room.currentQuestionIndex + 1} OF {room.totalQuestions}
                </span>
                <span className="text-xs font-bold text-slate-300">
                  {room.currentDurationSeconds}s Snippet
                </span>
              </div>

              {/* Visualizer & Audio Control */}
              <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 text-center mb-6">
                <AudioVisualizer isPlaying={isPlaying} />
                <button
                  onClick={handlePlayAudio}
                  disabled={isPlaying}
                  className="mt-3 px-6 py-2.5 rounded-xl bg-bollywood-gold hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 mx-auto transition-colors"
                >
                  {isPlaying ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Playing Snippet...' : `Play Audio (${room.currentDurationSeconds}s)`}
                </button>
              </div>

              {/* Input or Round End state */}
              {room.status === 'PLAYING' ? (
                <form onSubmit={handleSubmitGuess} className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={guess}
                      onChange={e => setGuess(e.target.value)}
                      placeholder="Type your guess here..."
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-bollywood-gold"
                    />
                    <button
                      type="submit"
                      disabled={!guess.trim()}
                      className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs uppercase"
                    >
                      Submit
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

                  {isHost && (
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => handleAdvanceStage(true)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-amber-400 flex items-center gap-1.5"
                      >
                        <SkipForward className="w-4 h-4" />
                        Host: Skip & Unlock More Audio
                      </button>
                    </div>
                  )}
                </form>
              ) : (
                /* Round Over Reveal */
                <div className="text-center py-4">
                  <span className="text-xs font-bold text-bollywood-gold uppercase">ROUND OVER</span>
                  <h3 className="text-2xl font-black text-white mt-1">
                    {room.revealedSong?.titleEn} ({room.revealedSong?.filmTitleEn})
                  </h3>
                  <p className="text-sm text-amber-400 font-hindi mt-0.5">
                    {room.revealedSong?.titleHi}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Singers: {room.revealedSong?.singers.join(', ')} • Composer: {room.revealedSong?.musicDirectors.join(', ')}
                  </p>

                  {isHost && (
                    <button
                      onClick={() => handleAdvanceStage(false)}
                      className="mt-6 px-6 py-3 rounded-xl bg-bollywood-gold text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-amber-400 transition-colors"
                    >
                      {room.status === 'GAME_OVER' ? 'Final Standings' : 'Next Song ➔'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Leaderboard & Reactions Sidebar */}
        <div className="space-y-6">
          {/* Leaderboard Card */}
          <div className="bg-bollywood-surface p-5 rounded-3xl border border-bollywood-border shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-bollywood-gold" />
              <h4 className="font-black text-white text-sm uppercase tracking-wider">Live Scores</h4>
            </div>

            <div className="space-y-2">
              {room.players.map((p, idx) => (
                <div
                  key={p.playerId}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    p.playerId === playerId
                      ? 'bg-slate-800/90 border-amber-500/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black text-slate-500 w-4">#{idx + 1}</span>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-slate-950"
                      style={{ backgroundColor: p.avatarColor || '#f59e0b' }}
                    >
                      {p.nickname.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white flex items-center gap-1">
                        {p.nickname}
                        {p.host && <Crown className="w-3 h-3 text-amber-400" />}
                      </div>
                      {p.answered && (
                        <span className="text-[10px] text-emerald-400 font-semibold">Answered!</span>
                      )}
                    </div>
                  </div>
                  <span className="font-black text-sm text-amber-400">{p.score} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emoji Reactions Bar */}
          <div className="bg-bollywood-surface p-4 rounded-2xl border border-bollywood-border text-center">
            <span className="text-[11px] font-bold text-slate-400 block mb-2 uppercase">Cheer Your Friends</span>
            <div className="flex justify-between items-center text-xl">
              {['🔥', '🎉', '🎸', '👏', '❤️', '😂'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleSendEmoji(emoji)}
                  className="hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Simple Party Chat */}
          <div className="bg-bollywood-surface p-4 rounded-2xl border border-bollywood-border">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-400 uppercase">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Party Chat</span>
            </div>
            <div className="h-28 overflow-y-auto space-y-1 text-xs mb-2 bg-slate-950/60 p-2 rounded-xl">
              {chatMessages.length === 0 ? (
                <p className="text-slate-600 italic">No messages yet...</p>
              ) : (
                chatMessages.map((m, i) => (
                  <div key={i} className="text-slate-300">
                    <strong className="text-amber-400">{m.sender}: </strong>
                    <span>{m.text}</span>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSendChat} className="flex gap-1.5">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Say something..."
                className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              />
              <button type="submit" className="px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-lg text-white">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
