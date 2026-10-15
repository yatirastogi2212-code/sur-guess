package com.surguess.model;

import jakarta.persistence.*;

@Entity
@Table(name = "song_artist_credits", indexes = {
    @Index(name = "idx_credit_song", columnList = "song_id"),
    @Index(name = "idx_credit_artist", columnList = "artist_id")
})
public class SongArtistCredit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "song_id", nullable = false)
    private Song song;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "artist_id", nullable = false)
    private Artist artist;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CreditRole creditRole;

    public SongArtistCredit() {}

    public SongArtistCredit(Song song, Artist artist, CreditRole creditRole) {
        this.song = song;
        this.artist = artist;
        this.creditRole = creditRole;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Song getSong() { return song; }
    public void setSong(Song song) { this.song = song; }

    public Artist getArtist() { return artist; }
    public void setArtist(Artist artist) { this.artist = artist; }

    public CreditRole getCreditRole() { return creditRole; }
    public void setCreditRole(CreditRole creditRole) { this.creditRole = creditRole; }
}
