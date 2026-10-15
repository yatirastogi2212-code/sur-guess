package com.surguess.controller;

import com.surguess.dto.GuessResultDto;
import com.surguess.dto.GuessSubmissionDto;
import com.surguess.dto.QuizQuestionDto;
import com.surguess.dto.SongDetailDto;
import com.surguess.model.GameMode;
import com.surguess.service.CatalogueService;
import com.surguess.service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    private final QuizService quizService;
    private final CatalogueService catalogueService;

    public QuizController(QuizService quizService, CatalogueService catalogueService) {
        this.quizService = quizService;
        this.catalogueService = catalogueService;
    }

    public static class StartQuizRequest {
        public String mode = "PROGRESSIVE";
        public String categoryType;
        public String categoryValue;
        public Integer count = 10;
    }

    @PostMapping("/start")
    public QuizQuestionDto startQuiz(@RequestBody(required = false) StartQuizRequest req) {
        if (req == null) req = new StartQuizRequest();
        GameMode gameMode;
        try {
            gameMode = GameMode.valueOf(req.mode.toUpperCase());
        } catch (Exception e) {
            gameMode = GameMode.PROGRESSIVE;
        }

        return quizService.startSession(gameMode, req.categoryType, req.categoryValue, req.count);
    }

    @GetMapping("/daily")
    public QuizQuestionDto getDailyQuiz() {
        return quizService.getDailySession();
    }

    @GetMapping("/current")
    public ResponseEntity<QuizQuestionDto> getCurrentQuestion(@RequestParam String token) {
        return quizService.getSessionCurrentQuestion(token)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/guess")
    public GuessResultDto submitGuess(@RequestBody GuessSubmissionDto submission) {
        return quizService.submitGuess(submission);
    }

    public static class TriviaItem {
        public Long id;
        public String question;
        public String correctAnswer;
        public List<String> options;
        public String explanation;
        public String filmOrSong;
    }

    @GetMapping("/trivia")
    public List<TriviaItem> getTriviaQuestions() {
        List<SongDetailDto> songs = catalogueService.getAllActiveSongs();
        Collections.shuffle(songs);

        List<TriviaItem> triviaList = new ArrayList<>();
        int count = 0;
        for (SongDetailDto song : songs) {
            if (song.getTriviaFact() == null || song.getTriviaFact().isBlank()) continue;

            TriviaItem item = new TriviaItem();
            item.id = song.getId();
            item.question = "Which song or recording has this story? \"" + song.getTriviaFact() + "\"";
            item.correctAnswer = song.getTitleEn();
            item.filmOrSong = song.getTitleEn() + " (" + song.getFilmTitleEn() + ")";
            item.explanation = song.getTriviaFact();

            // 3 distractors
            List<String> options = new ArrayList<>();
            options.add(song.getTitleEn());
            List<SongDetailDto> others = new ArrayList<>(songs);
            Collections.shuffle(others);
            for (SongDetailDto other : others) {
                if (!other.getId().equals(song.getId()) && !options.contains(other.getTitleEn())) {
                    options.add(other.getTitleEn());
                    if (options.size() == 4) break;
                }
            }
            Collections.shuffle(options);
            item.options = options;

            triviaList.add(item);
            count++;
            if (count >= 10) break;
        }

        return triviaList;
    }
}
