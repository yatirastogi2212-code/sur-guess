package com.surguess.model;

import jakarta.persistence.*;

@Entity
@Table(name = "player_sessions", indexes = {
    @Index(name = "idx_player_room", columnList = "roomCode")
})
public class PlayerSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String roomCode;

    @Column(nullable = false)
    private String playerId;

    @Column(nullable = false)
    private String nickname;

    private int score = 0;

    private boolean answered = false;

    private boolean host = false;

    private String avatarColor;

    public PlayerSession() {}

    public PlayerSession(String roomCode, String playerId, String nickname, boolean isHost, String avatarColor) {
        this.roomCode = roomCode;
        this.playerId = playerId;
        this.nickname = nickname;
        this.host = isHost;
        this.avatarColor = avatarColor;
        this.score = 0;
        this.answered = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoomCode() { return roomCode; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }

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
