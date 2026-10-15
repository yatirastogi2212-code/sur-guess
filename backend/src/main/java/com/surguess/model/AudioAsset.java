package com.surguess.model;

import jakarta.persistence.*;

@Entity
@Table(name = "audio_assets", indexes = {
    @Index(name = "idx_audio_song", columnList = "song_id")
})
public class AudioAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "song_id", nullable = false)
    private Song song;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AudioProviderType provider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AudioRightsStatus rightsStatus;

    private String licenseType;

    @Column(columnDefinition = "TEXT")
    private String attribution;

    private String sourceUrl;

    private Integer durationMs;

    private boolean playable = true;

    public AudioAsset() {}

    public AudioAsset(Song song, AudioProviderType provider, AudioRightsStatus rightsStatus, String licenseType, String attribution, String sourceUrl, Integer durationMs, boolean playable) {
        this.song = song;
        this.provider = provider;
        this.rightsStatus = rightsStatus;
        this.licenseType = licenseType;
        this.attribution = attribution;
        this.sourceUrl = sourceUrl;
        this.durationMs = durationMs;
        this.playable = playable;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Song getSong() { return song; }
    public void setSong(Song song) { this.song = song; }

    public AudioProviderType getProvider() { return provider; }
    public void setProvider(AudioProviderType provider) { this.provider = provider; }

    public AudioRightsStatus getRightsStatus() { return rightsStatus; }
    public void setRightsStatus(AudioRightsStatus rightsStatus) { this.rightsStatus = rightsStatus; }

    public String getLicenseType() { return licenseType; }
    public void setLicenseType(String licenseType) { this.licenseType = licenseType; }

    public String getAttribution() { return attribution; }
    public void setAttribution(String attribution) { this.attribution = attribution; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public Integer getDurationMs() { return durationMs; }
    public void setDurationMs(Integer durationMs) { this.durationMs = durationMs; }

    public boolean isPlayable() { return playable; }
    public void setPlayable(boolean playable) { this.playable = playable; }
}
