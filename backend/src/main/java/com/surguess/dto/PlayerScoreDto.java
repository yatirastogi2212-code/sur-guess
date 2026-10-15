package com.surguess.dto;

public class PlayerScoreDto {
    private String playerId;
    private String nickname;
    private int score;
    private boolean answered;
    private boolean host;
    private String avatarColor;

    public PlayerScoreDto() {}

    public PlayerScoreDto(String playerId, String nickname, int score, boolean answered, boolean host, String avatarColor) {
        this.playerId = playerId;
        this.nickname = nickname;
        this.score = score;
        this.answered = answered;
        this.host = host;
        this.avatarColor = avatarColor;
    }

    public String getPlayerId() { return playerId; }
    public void setPlayerId(String playerId) { this.playerId = playerId; }
    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }
    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
    public boolean isAnswered() { return answered; }
    public void setAnswered(boolean answered) { this.answered = answered; }
    public boolean isHost() { return host; }
    public void setHost(boolean host) { this.host = host; }
    public String getAvatarColor() { return avatarColor; }
    public void setAvatarColor(String avatarColor) { this.avatarColor = avatarColor; }
}
