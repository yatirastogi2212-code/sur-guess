package com.surguess.dto;

public class GuessSubmissionDto {
    private String sessionToken;
    private String guess;
    private boolean skip;
    private double timeElapsedSeconds;
    private String riskChoice; // For Duo-Chauk-Cash mode: "DUO", "SQUARE", "CASH"

    public GuessSubmissionDto() {}

    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }
    public String getGuess() { return guess; }
    public void setGuess(String guess) { this.guess = guess; }
    public boolean isSkip() { return skip; }
    public void setSkip(boolean skip) { this.skip = skip; }
    public double getTimeElapsedSeconds() { return timeElapsedSeconds; }
    public void setTimeElapsedSeconds(double timeElapsedSeconds) { this.timeElapsedSeconds = timeElapsedSeconds; }
    public String getRiskChoice() { return riskChoice; }
    public void setRiskChoice(String riskChoice) { this.riskChoice = riskChoice; }
}
