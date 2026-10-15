package com.surguess;

import com.surguess.dto.GuessResultDto;
import com.surguess.dto.GuessSubmissionDto;
import com.surguess.dto.QuizQuestionDto;
import com.surguess.model.Film;
import com.surguess.model.GameMode;
import com.surguess.model.Song;
import com.surguess.repository.*;
import com.surguess.service.CatalogueService;
import com.surguess.service.MatchingService;
import com.surguess.service.ProgressiveAudioService;
import com.surguess.service.QuizService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class QuizServiceTest {

    @Autowired
    private QuizService quizService;

    @Autowired
    private SongRepository songRepository;

    @Autowired
    private FilmRepository filmRepository;

    @Autowired
    private QuizSessionRepository sessionRepository;

    @Test
    void testProgressiveGameFlow() {
        // 1. Start a progressive session
        QuizQuestionDto question = quizService.startSession(GameMode.PROGRESSIVE, null, null, 3);
        assertNotNull(question);
        assertNotNull(question.getSessionToken());
        assertEquals(1, question.getCurrentStage());
        assertEquals(0.1, question.getCurrentDurationSeconds());
        assertEquals(1, question.getQuestionNumber());
        assertEquals(3, question.getTotalQuestions());

        Long originalSongId = question.getQuestionSongId();

        // 2. Submit a skip
        GuessSubmissionDto skipReq = new GuessSubmissionDto();
        skipReq.setSessionToken(question.getSessionToken());
        skipReq.setSkip(true);

        GuessResultDto skipRes = quizService.submitGuess(skipReq);
        assertFalse(skipRes.isCorrect());
        assertFalse(skipRes.isRoundEnded());
        assertEquals(2, skipRes.getNextStage());
        assertEquals(0.5, skipRes.getNextDurationSeconds());

        // Verify the song has NOT changed
        QuizQuestionDto currentQ = quizService.getSessionCurrentQuestion(question.getSessionToken()).orElseThrow();
        assertEquals(originalSongId, currentQ.getQuestionSongId());
        assertEquals(2, currentQ.getCurrentStage());
        assertEquals(0.5, currentQ.getCurrentDurationSeconds());

        // 3. Submit a correct answer using official title
        Song targetSong = songRepository.findById(originalSongId).orElseThrow();
        GuessSubmissionDto correctReq = new GuessSubmissionDto();
        correctReq.setSessionToken(question.getSessionToken());
        correctReq.setGuess(targetSong.getTitleEn());
        correctReq.setSkip(false);
        correctReq.setTimeElapsedSeconds(2.0);

        GuessResultDto correctRes = quizService.submitGuess(correctReq);
        assertTrue(correctRes.isCorrect());
        assertTrue(correctRes.isRoundEnded());
        assertTrue(correctRes.getPointsAwarded() > 0);
        assertNotNull(correctRes.getRevealedSong());
        assertEquals(targetSong.getTitleEn(), correctRes.getRevealedSong().getTitleEn());
    }

    @Test
    void testExhaustionEndsRound() {
        QuizQuestionDto question = quizService.startSession(GameMode.PROGRESSIVE, null, null, 1);
        String token = question.getSessionToken();

        // Skip 6 times to reach stage 7
        for (int i = 1; i <= 6; i++) {
            GuessSubmissionDto skipReq = new GuessSubmissionDto();
            skipReq.setSessionToken(token);
            skipReq.setSkip(true);
            quizService.submitGuess(skipReq);
        }

        // Now at stage 7, skip once more -> should exhaust round
        GuessSubmissionDto finalSkip = new GuessSubmissionDto();
        finalSkip.setSessionToken(token);
        finalSkip.setSkip(true);

        GuessResultDto exhaustedRes = quizService.submitGuess(finalSkip);
        assertFalse(exhaustedRes.isCorrect());
        assertTrue(exhaustedRes.isRoundEnded());
        assertEquals(0, exhaustedRes.getPointsAwarded());
        assertNotNull(exhaustedRes.getRevealedSong());
    }

    @Test
    void testDailySessionDeterministic() {
        QuizQuestionDto daily1 = quizService.getDailySession();
        QuizQuestionDto daily2 = quizService.getDailySession();

        assertNotNull(daily1);
        assertNotNull(daily2);
        // Both daily sessions created today must feature the exact same song ID!
        assertEquals(daily1.getQuestionSongId(), daily2.getQuestionSongId());
    }
}
