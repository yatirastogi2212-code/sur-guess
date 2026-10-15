package com.surguess.dto;

public class GuessResultDto {
    private boolean correct;
    private boolean roundEnded;
    private boolean gameEnded;
    private int pointsAwarded;
    private int currentTotalScore;
    private int nextStage;
    private double nextDurationSeconds;
    private String feedbackMessage;
    private SongDetailDto revealedSong; // Only populated when roundEnded == true

    public GuessResultDto() {}

    public boolean isCorrect() { return correct; }
    public void setCorrect(boolean correct) { this.correct = correct; }
    public boolean isRoundEnded() { return roundEnded; }
    public void setRoundEnded(boolean roundEnded) { this.roundEnded = roundEnded; }
    public boolean isGameEnded() { return gameEnded; }
    public void setGameEnded(boolean gameEnded) { this.gameEnded = gameEnded; }
    public int getPointsAwarded() { return pointsAwarded; }
    public void setPointsAwarded(int pointsAwarded) { this.pointsAwarded = pointsAwarded; }
    public int getCurrentTotalScore() { return currentTotalScore; }
    public void setCurrentTotalScore(int currentTotalScore) { this.currentTotalScore = currentTotalScore; }
    public int getNextStage() { return nextStage; }
    public void setNextStage(int nextStage) { this.nextStage = nextStage; }
    public double getNextDurationSeconds() { return nextDurationSeconds; }
    public void setNextDurationSeconds(double nextDurationSeconds) { this.nextDurationSeconds = nextDurationSeconds; }
    public String getFeedbackMessage() { return feedbackMessage; }
    public void setFeedbackMessage(String feedbackMessage) { this.feedbackMessage = feedbackMessage; }
    public SongDetailDto getRevealedSong() { return revealedSong; }
    public void setRevealedSong(SongDetailDto revealedSong) { this.revealedSong = revealedSong; }
}
