package com.surguess.service;

import com.surguess.dto.GuessResultDto;
import com.surguess.dto.GuessSubmissionDto;
import com.surguess.dto.QuizQuestionDto;
import com.surguess.dto.SongDetailDto;
import com.surguess.model.GameMode;
import com.surguess.model.QuizSession;
import com.surguess.model.Song;
import com.surguess.repository.QuizSessionRepository;
import com.surguess.repository.SongRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuizService {

    private final SongRepository songRepository;
    private final QuizSessionRepository sessionRepository;
    private final MatchingService matchingService;
    private final ProgressiveAudioService progressiveAudioService;
    private final CatalogueService catalogueService;

    public QuizService(SongRepository songRepository,
                       QuizSessionRepository sessionRepository,
                       MatchingService matchingService,
                       ProgressiveAudioService progressiveAudioService,
                       CatalogueService catalogueService) {
        this.songRepository = songRepository;
        this.sessionRepository = sessionRepository;
        this.matchingService = matchingService;
        this.progressiveAudioService = progressiveAudioService;
        this.catalogueService = catalogueService;
    }

    public QuizQuestionDto startSession(GameMode mode, String categoryType, String categoryValue, Integer count) {
        int total = (count != null && count > 0) ? count : 10;
        List<Song> pool;

        if ("decade".equalsIgnoreCase(categoryType) && categoryValue != null) {
            pool = songRepository.findByDecadeAndActiveTrue(categoryValue);
        } else if ("genre".equalsIgnoreCase(categoryType) && categoryValue != null) {
            pool = songRepository.findByPrimaryGenreIgnoreCaseAndActiveTrue(categoryValue);
        } else if ("artist".equalsIgnoreCase(categoryType) && categoryValue != null) {
            try {
                Long artistId = Long.parseLong(categoryValue);
                pool = songRepository.findByArtistId(artistId);
            } catch (NumberFormatException e) {
                pool = songRepository.findByActiveTrue();
            }
        } else {
            pool = songRepository.findByActiveTrue();
        }

        if (pool.isEmpty()) {
            pool = songRepository.findByActiveTrue();
        }

        List<Song> shuffled = new ArrayList<>(pool);
        Collections.shuffle(shuffled);
        List<Song> selected = shuffled.stream().limit(total).collect(Collectors.toList());

        String songIds = selected.stream()
                .map(s -> String.valueOf(s.getId()))
                .collect(Collectors.joining(","));

        String token = UUID.randomUUID().toString();
        QuizSession session = new QuizSession(token, mode, selected.size(), songIds);
        sessionRepository.save(session);

        return buildQuestionDto(session);
    }

    public QuizQuestionDto getDailySession() {
        // Daily challenge has deterministic seed based on current date
        LocalDate today = LocalDate.now();
        int daySeed = today.getYear() * 10000 + today.getMonthValue() * 100 + today.getDayOfMonth();
        List<Song> allSongs = songRepository.findByActiveTrue();
        if (allSongs.isEmpty()) {
            throw new IllegalStateException("Catalogue has no active songs");
        }

        // Pick one deterministic song for daily challenge
        int index = Math.abs(daySeed) % allSongs.size();
        Song dailySong = allSongs.get(index);

        String token = "daily-" + today + "-" + UUID.randomUUID().toString().substring(0, 8);
        QuizSession session = new QuizSession(token, GameMode.PROGRESSIVE, 1, String.valueOf(dailySong.getId()));
        sessionRepository.save(session);

        return buildQuestionDto(session);
    }

    public Optional<QuizQuestionDto> getSessionCurrentQuestion(String sessionToken) {
        return sessionRepository.findBySessionToken(sessionToken).map(this::buildQuestionDto);
    }

    public GuessResultDto submitGuess(GuessSubmissionDto submission) {
        QuizSession session = sessionRepository.findBySessionToken(submission.getSessionToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid session token"));

        if (session.isCompleted()) {
            GuessResultDto res = new GuessResultDto();
            res.setGameEnded(true);
            res.setFeedbackMessage("Quiz is already completed!");
            res.setCurrentTotalScore(session.getScore());
            return res;
        }

        Long currentSongId = getCurrentSongId(session);
        Song currentSong = songRepository.findById(currentSongId)
                .orElseThrow(() -> new IllegalStateException("Current song not found in catalogue"));

        GuessResultDto result = new GuessResultDto();

        if (session.getGameMode() == GameMode.PROGRESSIVE) {
            handleProgressiveGuess(submission, session, currentSong, result);
        } else if (session.getGameMode() == GameMode.DUO_SQUARE_CASH) {
            handleDuoSquareCashGuess(submission, session, currentSong, result);
        } else {
            handleStandardQuizGuess(submission, session, currentSong, result);
        }

        sessionRepository.save(session);
        return result;
    }

    private void handleProgressiveGuess(GuessSubmissionDto submission, QuizSession session, Song currentSong, GuessResultDto result) {
        if (submission.isSkip()) {
            // Player chose to skip and reveal longer snippet
            if (progressiveAudioService.isExhausted(session.getCurrentStage())) {
                // Exhausted all 7 stages! Round ends with 0 points
                finishRound(session, currentSong, result, false, 0, "Out of reveals! Song revealed.");
            } else {
                int nextStage = session.getCurrentStage() + 1;
                session.setCurrentStage(nextStage);
                result.setCorrect(false);
                result.setRoundEnded(false);
                result.setNextStage(nextStage);
                result.setNextDurationSeconds(progressiveAudioService.getDurationForStage(nextStage));
                result.setFeedbackMessage("Skipped! Audio extended to " + result.getNextDurationSeconds() + "s");
                result.setCurrentTotalScore(session.getScore());
            }
            return;
        }

        // Player submitted a guess
        boolean isMatch = matchingService.matchesSong(submission.getGuess(), currentSong);
        if (isMatch) {
            int pts = progressiveAudioService.calculatePoints(session.getCurrentStage(), submission.getTimeElapsedSeconds());
            session.setScore(session.getScore() + pts);
            finishRound(session, currentSong, result, true, pts, "Sahi Jawab! Correct in " + progressiveAudioService.getDurationForStage(session.getCurrentStage()) + "s (+" + pts + " pts) 🎉");
        } else {
            // Incorrect guess
            if (progressiveAudioService.isExhausted(session.getCurrentStage())) {
                finishRound(session, currentSong, result, false, 0, "Incorrect! No reveals remaining.");
            } else {
                int nextStage = session.getCurrentStage() + 1;
                session.setCurrentStage(nextStage);
                result.setCorrect(false);
                result.setRoundEnded(false);
                result.setNextStage(nextStage);
                result.setNextDurationSeconds(progressiveAudioService.getDurationForStage(nextStage));
                result.setFeedbackMessage("Galat Jawab! Next snippet unlocked: " + result.getNextDurationSeconds() + "s");
                result.setCurrentTotalScore(session.getScore());
            }
        }
    }

    private void handleDuoSquareCashGuess(GuessSubmissionDto submission, QuizSession session, Song currentSong, GuessResultDto result) {
        boolean isMatch = matchingService.matchesSong(submission.getGuess(), currentSong);
        String choice = submission.getRiskChoice() != null ? submission.getRiskChoice().toUpperCase() : "SQUARE";
        int awarded = 0;

        if (isMatch) {
            if ("CASH".equals(choice)) {
                awarded = 500;
            } else if ("SQUARE".equals(choice)) {
                awarded = 300;
            } else {
                awarded = 100; // DUO
            }
            session.setScore(session.getScore() + awarded);
            finishRound(session, currentSong, result, true, awarded, "Bravo! Correct on " + choice + " mode (+" + awarded + " pts)!");
        } else {
            finishRound(session, currentSong, result, false, 0, "Incorrect guess! 0 points for this round.");
        }
    }

    private void handleStandardQuizGuess(GuessSubmissionDto submission, QuizSession session, Song currentSong, GuessResultDto result) {
        boolean isMatch = matchingService.matchesSong(submission.getGuess(), currentSong);
        if (isMatch) {
            int pts = 100;
            if (submission.getTimeElapsedSeconds() > 0 && submission.getTimeElapsedSeconds() < 5.0) {
                pts += (int) ((5.0 - submission.getTimeElapsedSeconds()) * 10);
            }
            session.setScore(session.getScore() + pts);
            finishRound(session, currentSong, result, true, pts, "Correct! (+" + pts + " pts)");
        } else {
            finishRound(session, currentSong, result, false, 0, "Incorrect! The correct answer was: " + currentSong.getTitleEn());
        }
    }

    private void finishRound(QuizSession session, Song currentSong, GuessResultDto result, boolean correct, int pts, String message) {
        result.setCorrect(correct);
        result.setRoundEnded(true);
        result.setPointsAwarded(pts);
        result.setCurrentTotalScore(session.getScore());
        result.setFeedbackMessage(message);
        result.setRevealedSong(catalogueService.mapToDetailDto(currentSong));

        // Advance to next question
        int nextIndex = session.getCurrentQuestionIndex() + 1;
        if (nextIndex >= session.getTotalQuestions()) {
            session.setCompleted(true);
            result.setGameEnded(true);
        } else {
            session.setCurrentQuestionIndex(nextIndex);
            session.setCurrentStage(1);
            result.setGameEnded(false);
        }
    }

    private Long getCurrentSongId(QuizSession session) {
        String[] ids = session.getSongSequenceIds().split(",");
        if (session.getCurrentQuestionIndex() < ids.length) {
            return Long.parseLong(ids[session.getCurrentQuestionIndex()].trim());
        }
        return Long.parseLong(ids[0].trim());
    }

    private QuizQuestionDto buildQuestionDto(QuizSession session) {
        Long songId = getCurrentSongId(session);
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new IllegalStateException("Song not found"));

        QuizQuestionDto dto = new QuizQuestionDto();
        dto.setSessionToken(session.getSessionToken());
        dto.setQuestionNumber(session.getCurrentQuestionIndex() + 1);
        dto.setTotalQuestions(session.getTotalQuestions());
        dto.setQuestionSongId(song.getId());
        dto.setGameMode(session.getGameMode().name());
        dto.setCurrentStage(session.getCurrentStage());
        dto.setCurrentDurationSeconds(progressiveAudioService.getDurationForStage(session.getCurrentStage()));
        dto.setSignatureRiffNotes(song.getSignatureRiffNotes());

        SongDetailDto detail = catalogueService.mapToDetailDto(song);
        dto.setAudioProvider(detail.getAudioProvider());
        dto.setSourceUrl(detail.getSourceUrl());
        dto.setPreviewUrl(detail.getPreviewUrl());
        dto.setSnippetStartOffset(song.getSnippetStartOffset() != null ? song.getSnippetStartOffset() : 5.0);

        if (session.getGameMode() == GameMode.STANDARD_QUIZ || session.getGameMode() == GameMode.DUO_SQUARE_CASH) {
            dto.setTimeLimitSeconds(15);
            dto.setOptions(generateOptions(song, session.getGameMode()));
        }

        return dto;
    }

    public List<String> generateOptions(Song correctSong, GameMode mode) {
        List<Song> candidates = songRepository.findByDecadeAndActiveTrue(correctSong.getDecade());
        if (candidates.size() < 4) {
            candidates = songRepository.findByActiveTrue();
        }

        List<Song> pool = candidates.stream()
                .filter(s -> !s.getId().equals(correctSong.getId()))
                .collect(Collectors.toList());
        Collections.shuffle(pool);

        List<String> options = new ArrayList<>();
        options.add(correctSong.getTitleEn());

        int distractorsNeeded = (mode == GameMode.DUO_SQUARE_CASH) ? 3 : 3;
        for (int i = 0; i < distractorsNeeded && i < pool.size(); i++) {
            options.add(pool.get(i).getTitleEn());
        }

        Collections.shuffle(options);
        return options;
    }
}
