package com.surguess.dto;

import java.util.List;

public class RoomStateDto {
    private String roomCode;
    private String hostPlayerId;
    private String status;
    private String gameMode;
    private int currentQuestionIndex;
    private int totalQuestions;
    private int currentStage;
    private double currentDurationSeconds;
    private String signatureRiffNotes;
    private String sourceUrl;
    private String previewUrl;
    private Double snippetStartOffset;
    private List<PlayerScoreDto> players;
    private SongDetailDto revealedSong;

    public RoomStateDto() {}

    public String getPreviewUrl() { return previewUrl; }
    public void setPreviewUrl(String previewUrl) { this.previewUrl = previewUrl; }
    public Double getSnippetStartOffset() { return snippetStartOffset != null ? snippetStartOffset : 5.0; }
    public void setSnippetStartOffset(Double snippetStartOffset) { this.snippetStartOffset = snippetStartOffset; }

    public String getRoomCode() { return roomCode; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
    public String getHostPlayerId() { return hostPlayerId; }
    public void setHostPlayerId(String hostPlayerId) { this.hostPlayerId = hostPlayerId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getGameMode() { return gameMode; }
    public void setGameMode(String gameMode) { this.gameMode = gameMode; }
    public int getCurrentQuestionIndex() { return currentQuestionIndex; }
    public void setCurrentQuestionIndex(int currentQuestionIndex) { this.currentQuestionIndex = currentQuestionIndex; }
    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }
    public int getCurrentStage() { return currentStage; }
    public void setCurrentStage(int currentStage) { this.currentStage = currentStage; }
    public double getCurrentDurationSeconds() { return currentDurationSeconds; }
    public void setCurrentDurationSeconds(double currentDurationSeconds) { this.currentDurationSeconds = currentDurationSeconds; }
    public String getSignatureRiffNotes() { return signatureRiffNotes; }
    public void setSignatureRiffNotes(String signatureRiffNotes) { this.signatureRiffNotes = signatureRiffNotes; }
    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }
    public List<PlayerScoreDto> getPlayers() { return players; }
    public void setPlayers(List<PlayerScoreDto> players) { this.players = players; }
    public SongDetailDto getRevealedSong() { return revealedSong; }
    public void setRevealedSong(SongDetailDto revealedSong) { this.revealedSong = revealedSong; }
}
