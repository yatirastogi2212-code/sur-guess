# SurGuess (सुर-गेस)
### The Hindi & Bollywood Music Guessing Platform

> Inspired by the publicly observable gameplay of **SongTrivia.io**, **Heardle**, and **Tout le monde veut prendre sa place**, **SurGuess** is an authentic, Hindi-first music guessing platform dedicated to Indian cinema soundtracks, playback singers, music directors, lyricists, decades, and trivia lore.

---

## 🌟 Key Features

1. **Ultra-Short Audio Progressive Guessing (Signature Mode)**
   - Starts with a **0.1-second** audio clip!
   - Skip to reveal progressively longer portions: `0.1s ➔ 0.5s ➔ 1.0s ➔ 2.0s ➔ 4.0s ➔ 8.0s ➔ 15.0s`.
   - Players aim to identify the song using the minimum audio exposure for maximum points (up to 1050 pts).
   - Replay control allows listening to the unlocked window without advancing the stage.
   - Comprehensive end-of-round reveal displays official title, Devanagari Hindi title, singers, movie, composer, lyricist, release year, and verified trivia lore.

2. **Standard 4-Option Audio Quiz**
   - 10 questions per match with a 15-second countdown timer.
   - 4 plausible Bollywood options per question with instant feedback and scoring.

3. **Risk-and-Reward Mode (Duo / Chauk [Square] / Cash)**
   - Based on the classic French trivia format:
     - **Duo (+100 Pts):** Choose from 2 options (50/50 chance, low risk).
     - **Chauk / Square (+300 Pts):** Choose from 4 multiple-choice options (medium risk).
     - **Cash (+500 Pts):** Open-ended autocomplete guess without options (highest risk).
   - Incorrect answer yields 0 points!

4. **Multiplayer: Play With Friends**
   - Create private game rooms with unique 6-character room codes (e.g. `SUR942`).
   - Shareable room invitations and customizable player nicknames.
   - Synchronized audio snippet reveals across all joined devices.
   - Live real-time leaderboard with avatar colors.
   - Interactive party cheer emoji bar (`🔥`, `🎉`, `🎸`, `👏`, `❤️`, `😂`) and in-room chat.
   - Host controls for starting the game and advancing questions.

5. **Daily Bollywood Challenge**
   - Deterministic song selection based on calendar date (every player receives the exact same daily puzzle).
   - Daily streak tracking and shareable Heardle-style emoji result cards.

6. **Hindi Autocomplete & Answer Matching**
   - Unicode-aware normalization (NFKD decomposition, diacritic stripping, zero-width char removal).
   - Dual script support: Devanagari (`तुझे देखा तो`) and Romanized (`Tujhe Dekha Toh`).
   - Alias dictionary for common phonetic spellings and colloquial titles.
   - Conservative Levenshtein distance fallback for minor typos without accepting unrelated titles.

7. **8 Bollywood Decades & Curated Artists**
   - Browse and play quizzes by historical eras: **1950s (Golden Era)**, **1960s**, **1970s (Pancham & Kishore)**, **1980s**, **1990s (Melodic Renaissance)**, **2000s**, **2010s (Arijit & Pritam)**, **2020s (Modern Streaming)**.
   - Dedicated profiles for legends: Lata Mangeshkar, Kishore Kumar, Mohammed Rafi, Asha Bhosle, Mukesh, Kumar Sanu, Alka Yagnik, Sonu Nigam, KK, Shreya Ghoshal, Arijit Singh, R.D. Burman, A.R. Rahman, Pritam.

8. **Story-First Bollywood Trivia & Fun Facts**
   - Fact-checked studio lore, anecdotes, and recording stories turned into playable 4-option trivia rounds.

9. **100% Legal & Safe Audio Architecture**
   - **Zero unauthorized MP3 scraping** from commercial streaming services.
   - **Web Audio API Procedural Hook Synthesizer** creates authentic acoustic reed/synthesizer renditions of iconic Bollywood hooks with microsecond-accurate progressive time gating.
   - Complete admin console for reviewing audio assets and rights status (`APPROVED_SYNTHETIC`, `VERIFIED_PUBLIC_DOMAIN`, `LICENSED`, `PENDING_REVIEW`, `RIGHTS_RESTRICTED`).
   - Repeatable MusicBrainz and Wikidata ingestion pipeline adapters.

---

## 🏗️ Architecture & Technology Stack

- **Backend:**
  - Java 17 (LTS)
  - Spring Boot 3.2.5
  - Spring Web (REST API)
  - Spring WebSocket + STOMP over SockJS
  - Spring Data JPA + Hibernate
  - Embedded H2 Database (with PostgreSQL compatibility mode)
  - JUnit 5 Test Suite (12 unit and integration tests)
- **Frontend:**
  - React 18
  - TypeScript 5
  - Vite 5
  - Tailwind CSS 3
  - Lucide React Icons
  - Web Audio API (Dual-oscillator procedural synthesizer with ADSR envelopes and low-pass harmonium filtering)
  - HTML5 Canvas Real-time Frequency Analyser
  - Canvas Confetti

---

## 🚀 Setup & Running Instructions

### Prerequisites
- **Java:** JDK 17 or higher
- **Maven:** 3.8+ or bundled wrapper
- **Node.js:** v18.15.0 or higher
- **npm:** 9.0+

### 1. Start the Spring Boot Backend
In a terminal, navigate to the `backend` folder and run:
```powershell
cd C:\Users\yatir\.gemini\antigravity\scratch\surguess\backend
mvn spring-boot:run
```
The backend server will start on `http://localhost:8080`.
The database will automatically initialize and seed the curated Bollywood catalogue with 32+ timeless tracks.
- H2 Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/surguess`, User: `sa`, Password: empty)

### 2. Start the React Frontend
In a separate terminal, navigate to the `frontend` folder and run:
```powershell
cd C:\Users\yatir\.gemini\antigravity\scratch\surguess\frontend
npm run dev
```
The Vite development server will start on `http://localhost:5173`.
Vite is preconfigured to proxy `/api` and `/ws` requests to `http://localhost:8080`.

Open your browser at:
👉 **`http://localhost:5173`**

---

## 🧪 Running Automated Tests

Run backend unit and integration tests:
```powershell
cd C:\Users\yatir\.gemini\antigravity\scratch\surguess\backend
mvn test
```
The test suite covers:
- `MatchingServiceTest`: Unicode normalization, Devanagari matching, Romanized aliases, and Levenshtein distance boundary tests.
- `ProgressiveAudioServiceTest`: Step progression (`0.1s ➔ 15s`), stage bounds, score bonuses, and exhaustion rules.
- `QuizServiceTest`: Session creation, progressive audio skip verification (confirming skipping does NOT swap songs), exhaustion behavior, and daily deterministic seed verification.

Run frontend type check & production bundle build:
```powershell
cd C:\Users\yatir\.gemini\antigravity\scratch\surguess\frontend
npm run build
```

---

## ⚙️ Environment Variables

The application runs self-contained out-of-the-box with embedded storage. For custom production deployments:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `SERVER_PORT` | `8080` | Port for the Spring Boot backend |
| `SPRING_DATASOURCE_URL` | `jdbc:h2:file:./data/surguess;MODE=PostgreSQL` | JDBC database connection string |
| `SPRING_DATASOURCE_USERNAME` | `sa` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | *(empty)* | Database password |
| `SPRING_PROFILES_ACTIVE` | `default` | Set to `prod` when connecting to an external PostgreSQL instance |

---

## 📊 Summary of Implemented Features

| Feature | Reference (SongTrivia) | SurGuess Implementation | Status |
| :--- | :--- | :--- | :--- |
| **Progressive Audio** | Roadmap ("Heardle") | Complete 7-stage engine (0.1s - 15s) with Web Audio Synth | ✅ Implemented |
| **4-Option Quiz** | Standard audio quiz | 10 questions, 4 Bollywood options, 15s timer | ✅ Implemented |
| **Risk Mode** | Duo, Carré, Cash | Duo (2 options), Chauk (4 options), Cash (direct guess) | ✅ Implemented |
| **Multiplayer** | With Friends | Private rooms, 6-char codes, live score sync & emojis | ✅ Implemented |
| **Daily Challenge** | Linkzic / Wordzic | Deterministic daily song guess with streak & share grid | ✅ Implemented |
| **Decades** | 30s - 2020s | 8 Hindi Cinema Decades (1950s through 2020s) | ✅ Implemented |
| **Artists** | Top western artists | Curated playback singers & music directors with bios | ✅ Implemented |
| **Fun Facts / Trivia**| Story-first trivia | Verified Bollywood studio lore & anecdotes | ✅ Implemented |
| **Admin & Rights** | Internal | Audio asset rights review, alias manager, pipeline stubs | ✅ Implemented |
