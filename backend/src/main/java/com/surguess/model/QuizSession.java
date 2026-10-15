package com.surguess.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_sessions")
public class QuizSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sessionToken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GameMode gameMode;

    private int score = 0;

    private int currentQuestionIndex = 0;

    private int totalQuestions = 10;

    private int currentStage = 1; // For progressive mode: 1 to 7

    private boolean completed = false;

    @Column(columnDefinition = "TEXT")
    private String songSequenceIds; // Comma separated song IDs

    private LocalDateTime createdAt = LocalDateTime.now();

    public QuizSession() {}

    public QuizSession(String sessionToken, GameMode gameMode, int totalQuestions, String songSequenceIds) {
        this.sessionToken = sessionToken;
        this.gameMode = gameMode;
        this.totalQuestions = totalQuestions;
        this.songSequenceIds = songSequenceIds;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }

    public GameMode getGameMode() { return gameMode; }
    public void setGameMode(GameMode gameMode) { this.gameMode = gameMode; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getCurrentQuestionIndex() { return currentQuestionIndex; }
    public void setCurrentQuestionIndex(int currentQuestionIndex) { this.currentQuestionIndex = currentQuestionIndex; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public int getCurrentStage() { return currentStage; }
    public void setCurrentStage(int currentStage) { this.currentStage = currentStage; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public String getSongSequenceIds() { return songSequenceIds; }
    public void setSongSequenceIds(String songSequenceIds) { this.songSequenceIds = songSequenceIds; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
