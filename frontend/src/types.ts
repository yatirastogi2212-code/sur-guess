export type GameMode = 'PROGRESSIVE' | 'STANDARD_QUIZ' | 'DUO_SQUARE_CASH';

export interface SongDetail {
  id: number;
  slug: string;
  titleEn: string;
  titleHi: string;
  filmTitleEn: string;
  filmTitleHi: string;
  releaseYear: number;
  decade: string;
  primaryGenre: string;
  moodTags: string;
  tempoBpm: number;
  signatureRiffNotes: string;
  triviaFact: string;
  singers: string[];
  musicDirectors: string[];
  lyricists: string[];
  aliases: string[];
  audioProvider: string;
  rightsStatus: string;
  sourceUrl?: string;
  previewUrl?: string;
  snippetStartOffset?: number;
  playable: boolean;
}

export interface SongAutocomplete {
  id: number;
  titleEn: string;
  titleHi: string;
  filmTitleEn: string;
  releaseYear: number;
  singers: string;
}

export interface QuizQuestion {
  sessionToken: string;
  questionNumber: number;
  totalQuestions: number;
  questionSongId: number;
  gameMode: GameMode;
  currentStage: number;
  currentDurationSeconds: number;
  audioProvider: string;
  signatureRiffNotes?: string;
  sourceUrl?: string;
  previewUrl?: string;
  snippetStartOffset?: number;
  options?: string[];
  timeLimitSeconds?: number;
}

export interface GuessResult {
  correct: boolean;
  roundEnded: boolean;
  gameEnded: boolean;
  pointsAwarded: number;
  currentTotalScore: number;
  nextStage: number;
  nextDurationSeconds: number;
  feedbackMessage: string;
  revealedSong?: SongDetail;
}

export interface PlayerScore {
  playerId: string;
  nickname: string;
  score: number;
  answered: boolean;
  host: boolean;
  avatarColor: string;
}

export interface RoomState {
  roomCode: string;
  hostPlayerId: string;
  status: 'LOBBY' | 'PLAYING' | 'ROUND_OVER' | 'GAME_OVER' | 'CLOSED';
  gameMode: GameMode;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentStage: number;
  currentDurationSeconds: number;
  signatureRiffNotes?: string;
  sourceUrl?: string;
  previewUrl?: string;
  snippetStartOffset?: number;
  players: PlayerScore[];
  revealedSong?: SongDetail;
}

export interface TriviaItem {
  id: number;
  question: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
  filmOrSong: string;
}

export interface Artist {
  id: number;
  slug: string;
  nameEn: string;
  nameHi: string;
  type: string;
  bio: string;
  debutYear: number;
  activeEra: string;
  imageUrl: string;
  verified: boolean;
}

export interface Film {
  id: number;
  slug: string;
  titleEn: string;
  titleHi: string;
  releaseYear: number;
  decade: string;
  director: string;
  starring: string;
  bannerUrl: string;
}
