package com.surguess.dto;

import java.util.List;

public class QuizQuestionDto {
    private String sessionToken;
    private int questionNumber;
    private int totalQuestions;
    private Long questionSongId; // Hidden or used for audio synthesis key
    private String gameMode;
    private int currentStage;
    private double currentDurationSeconds;
    private String audioProvider;
    private String signatureRiffNotes; // Used by Web Audio Synth on client
    private String sourceUrl;
    private Double snippetStartOffset; // Offset in seconds to hook
    private String previewUrl;
    private List<String> options; // For 4-option quiz or Duo (2 options)
    private Integer timeLimitSeconds;

    public QuizQuestionDto() {}

    public Double getSnippetStartOffset() { return snippetStartOffset != null ? snippetStartOffset : 5.0; }
    public void setSnippetStartOffset(Double snippetStartOffset) { this.snippetStartOffset = snippetStartOffset; }
    public String getPreviewUrl() { return previewUrl; }
    public void setPreviewUrl(String previewUrl) { this.previewUrl = previewUrl; }

    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }
    public int getQuestionNumber() { return questionNumber; }
    public void setQuestionNumber(int questionNumber) { this.questionNumber = questionNumber; }
    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }
    public Long getQuestionSongId() { return questionSongId; }
    public void setQuestionSongId(Long questionSongId) { this.questionSongId = questionSongId; }
    public String getGameMode() { return gameMode; }
    public void setGameMode(String gameMode) { this.gameMode = gameMode; }
    public int getCurrentStage() { return currentStage; }
    public void setCurrentStage(int currentStage) { this.currentStage = currentStage; }
    public double getCurrentDurationSeconds() { return currentDurationSeconds; }
    public void setCurrentDurationSeconds(double currentDurationSeconds) { this.currentDurationSeconds = currentDurationSeconds; }
    public String getAudioProvider() { return audioProvider; }
    public void setAudioProvider(String audioProvider) { this.audioProvider = audioProvider; }
    public String getSignatureRiffNotes() { return signatureRiffNotes; }
    public void setSignatureRiffNotes(String signatureRiffNotes) { this.signatureRiffNotes = signatureRiffNotes; }
    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }
    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }
    public Integer getTimeLimitSeconds() { return timeLimitSeconds; }
    public void setTimeLimitSeconds(Integer timeLimitSeconds) { this.timeLimitSeconds = timeLimitSeconds; }
}
