package com.surguess.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_rooms")
public class GameRoom {

    @Id
    @Column(length = 8, nullable = false)
    private String roomCode;

    @Column(nullable = false)
    private String hostPlayerId;

    @Column(nullable = false)
    private String status = "LOBBY"; // LOBBY, PLAYING, ROUND_OVER, GAME_OVER

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GameMode gameMode = GameMode.PROGRESSIVE;

    private Long currentSongId;

    private int currentStage = 1;

    private int currentQuestionIndex = 0;

    private int totalQuestions = 5;

    @Column(columnDefinition = "TEXT")
    private String songSequenceIds;

    private LocalDateTime createdAt = LocalDateTime.now();

    public GameRoom() {}

    public GameRoom(String roomCode, String hostPlayerId, GameMode gameMode, int totalQuestions) {
        this.roomCode = roomCode;
        this.hostPlayerId = hostPlayerId;
        this.gameMode = gameMode;
        this.totalQuestions = totalQuestions;
        this.status = "LOBBY";
        this.createdAt = LocalDateTime.now();
    }

    public String getRoomCode() { return roomCode; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }

    public String getHostPlayerId() { return hostPlayerId; }
    public void setHostPlayerId(String hostPlayerId) { this.hostPlayerId = hostPlayerId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public GameMode getGameMode() { return gameMode; }
    public void setGameMode(GameMode gameMode) { this.gameMode = gameMode; }

    public Long getCurrentSongId() { return currentSongId; }
    public void setCurrentSongId(Long currentSongId) { this.currentSongId = currentSongId; }

    public int getCurrentStage() { return currentStage; }
    public void setCurrentStage(int currentStage) { this.currentStage = currentStage; }

    public int getCurrentQuestionIndex() { return currentQuestionIndex; }
    public void setCurrentQuestionIndex(int currentQuestionIndex) { this.currentQuestionIndex = currentQuestionIndex; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public String getSongSequenceIds() { return songSequenceIds; }
    public void setSongSequenceIds(String songSequenceIds) { this.songSequenceIds = songSequenceIds; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
