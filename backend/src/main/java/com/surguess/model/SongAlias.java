package com.surguess.model;

import jakarta.persistence.*;

@Entity
@Table(name = "song_aliases", indexes = {
    @Index(name = "idx_alias_song", columnList = "song_id"),
    @Index(name = "idx_alias_text", columnList = "aliasText")
})
public class SongAlias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id", nullable = false)
    private Song song;

    @Column(nullable = false)
    private String aliasText;

    private String scriptType; // LATIN, DEVANAGARI, PHONETIC

    public SongAlias() {}

    public SongAlias(Song song, String aliasText, String scriptType) {
        this.song = song;
        this.aliasText = aliasText;
        this.scriptType = scriptType;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Song getSong() { return song; }
    public void setSong(Song song) { this.song = song; }

    public String getAliasText() { return aliasText; }
    public void setAliasText(String aliasText) { this.aliasText = aliasText; }

    public String getScriptType() { return scriptType; }
    public void setScriptType(String scriptType) { this.scriptType = scriptType; }
}
