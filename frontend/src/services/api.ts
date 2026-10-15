import {
  Artist,
  Film,
  GameMode,
  GuessResult,
  QuizQuestion,
  RoomState,
  SongAutocomplete,
  SongDetail,
  TriviaItem
} from '../types';

const API_BASE = '/api';

export const api = {
  // Catalogue
  getAllSongs: async (): Promise<SongDetail[]> => {
    const res = await fetch(`${API_BASE}/catalogue/songs`);
    return res.json();
  },

  getSongById: async (id: number): Promise<SongDetail> => {
    const res = await fetch(`${API_BASE}/catalogue/songs/${id}`);
    return res.json();
  },

  getSongsByDecade: async (decade: string): Promise<SongDetail[]> => {
    const res = await fetch(`${API_BASE}/catalogue/decades/${decade}`);
    return res.json();
  },

  getSongsByGenre: async (genre: string): Promise<SongDetail[]> => {
    const res = await fetch(`${API_BASE}/catalogue/genres/${encodeURIComponent(genre)}`);
    return res.json();
  },

  getAllArtists: async (): Promise<Artist[]> => {
    const res = await fetch(`${API_BASE}/catalogue/artists`);
    return res.json();
  },

  getArtistBySlug: async (slug: string): Promise<Artist> => {
    const res = await fetch(`${API_BASE}/catalogue/artists/${slug}`);
    return res.json();
  },

  getSongsByArtist: async (slug: string): Promise<SongDetail[]> => {
    const res = await fetch(`${API_BASE}/catalogue/artists/${slug}/songs`);
    return res.json();
  },

  getAllFilms: async (): Promise<Film[]> => {
    const res = await fetch(`${API_BASE}/catalogue/films`);
    return res.json();
  },

  autocomplete: async (q: string): Promise<SongAutocomplete[]> => {
    if (!q || q.trim().length < 2) return [];
    const res = await fetch(`${API_BASE}/catalogue/autocomplete?q=${encodeURIComponent(q.trim())}`);
    return res.json();
  },

  // Quiz
  startQuiz: async (
    mode: GameMode = 'PROGRESSIVE',
    categoryType?: string,
    categoryValue?: string,
    count: number = 10
  ): Promise<QuizQuestion> => {
    const res = await fetch(`${API_BASE}/quiz/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, categoryType, categoryValue, count })
    });
    return res.json();
  },

  getDailyQuiz: async (): Promise<QuizQuestion> => {
    const res = await fetch(`${API_BASE}/quiz/daily`);
    return res.json();
  },

  getCurrentQuestion: async (sessionToken: string): Promise<QuizQuestion> => {
    const res = await fetch(`${API_BASE}/quiz/current?token=${encodeURIComponent(sessionToken)}`);
    return res.json();
  },

  submitGuess: async (
    sessionToken: string,
    guess: string,
    skip: boolean,
    timeElapsedSeconds: number,
    riskChoice?: string
  ): Promise<GuessResult> => {
    const res = await fetch(`${API_BASE}/quiz/guess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken, guess, skip, timeElapsedSeconds, riskChoice })
    });
    return res.json();
  },

  getTriviaQuestions: async (): Promise<TriviaItem[]> => {
    const res = await fetch(`${API_BASE}/quiz/trivia`);
    return res.json();
  },

  // Multiplayer Rooms
  createRoom: async (playerId: string, nickname: string, mode: GameMode = 'PROGRESSIVE', questions: number = 5): Promise<RoomState> => {
    const res = await fetch(`${API_BASE}/rooms/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, nickname, mode, questions })
    });
    return res.json();
  },

  joinRoom: async (roomCode: string, playerId: string, nickname: string): Promise<RoomState> => {
    const res = await fetch(`${API_BASE}/rooms/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode, playerId, nickname })
    });
    return res.json();
  },

  leaveRoom: async (roomCode: string, playerId: string): Promise<RoomState> => {
    const res = await fetch(`${API_BASE}/rooms/leave?roomCode=${roomCode}&playerId=${playerId}`, {
      method: 'POST'
    });
    return res.json();
  },

  getRoom: async (roomCode: string): Promise<RoomState> => {
    const res = await fetch(`${API_BASE}/rooms/${roomCode}`);
    return res.json();
  },

  startRoomGame: async (roomCode: string, playerId: string): Promise<RoomState> => {
    const res = await fetch(`${API_BASE}/rooms/${roomCode}/start?playerId=${playerId}`, {
      method: 'POST'
    });
    return res.json();
  },

  submitRoomGuess: async (roomCode: string, playerId: string, guess: string, timeElapsedSeconds: number): Promise<RoomState> => {
    const res = await fetch(`${API_BASE}/rooms/${roomCode}/guess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, guess, timeElapsedSeconds })
    });
    return res.json();
  },

  advanceRoom: async (roomCode: string, playerId: string, skipStage: boolean): Promise<RoomState> => {
    const res = await fetch(`${API_BASE}/rooms/${roomCode}/advance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, skipStage })
    });
    return res.json();
  },

  // Admin
  getAudioAssets: async () => {
    const res = await fetch(`${API_BASE}/admin/audio-assets`);
    return res.json();
  },

  updateAssetStatus: async (id: number, rightsStatus: string, playable: boolean, attribution?: string) => {
    const res = await fetch(`${API_BASE}/admin/audio-assets/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rightsStatus, playable, attribution })
    });
    return res.json();
  },

  addAlias: async (songId: number, aliasText: string, scriptType: string = 'LATIN') => {
    const res = await fetch(`${API_BASE}/admin/songs/${songId}/aliases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aliasText, scriptType })
    });
    return res.json();
  },

  importMusicBrainz: async (query?: string) => {
    const res = await fetch(`${API_BASE}/admin/import/musicbrainz?query=${query || 'bollywood'}`, {
      method: 'POST'
    });
    return res.json();
  },

  importWikidata: async (categoryQid?: string) => {
    const res = await fetch(`${API_BASE}/admin/import/wikidata?categoryQid=${categoryQid || 'Q22931'}`, {
      method: 'POST'
    });
    return res.json();
  }
};
