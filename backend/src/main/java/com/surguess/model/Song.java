package com.surguess.model;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "songs", indexes = {
    @Index(name = "idx_song_slug", columnList = "slug", unique = true),
    @Index(name = "idx_song_decade", columnList = "decade"),
    @Index(name = "idx_song_genre", columnList = "primaryGenre")
})
public class Song {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String titleEn;

    @Column(nullable = false)
    private String titleHi;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "film_id")
    private Film film;

    @Column(nullable = false)
    private Integer recordingYear;

    @Column(nullable = false)
    private String decade;

    @Column(nullable = false)
    private String primaryGenre;

    private String moodTags;

    private Integer tempoBpm;

    @Column(columnDefinition = "TEXT")
    private String signatureRiffNotes;

    @Column(columnDefinition = "TEXT")
    private String triviaFact;

    private Double snippetStartOffset = 5.0;

    @Column(columnDefinition = "TEXT")
    private String previewUrl;

    private boolean active = true;

    public Song() {}

    public Song(String slug, String titleEn, String titleHi, Film film, Integer recordingYear, String decade, String primaryGenre, String moodTags, Integer tempoBpm, String signatureRiffNotes, String triviaFact) {
        this(slug, titleEn, titleHi, film, recordingYear, decade, primaryGenre, moodTags, tempoBpm, signatureRiffNotes, triviaFact, 5.0, null);
    }

    public Song(String slug, String titleEn, String titleHi, Film film, Integer recordingYear, String decade, String primaryGenre, String moodTags, Integer tempoBpm, String signatureRiffNotes, String triviaFact, Double snippetStartOffset, String previewUrl) {
        this.slug = slug;
        this.titleEn = titleEn;
        this.titleHi = titleHi;
        this.film = film;
        this.recordingYear = recordingYear;
        this.decade = decade;
        this.primaryGenre = primaryGenre;
        this.moodTags = moodTags;
        this.tempoBpm = tempoBpm;
        this.signatureRiffNotes = signatureRiffNotes;
        this.triviaFact = triviaFact;
        this.snippetStartOffset = snippetStartOffset != null ? snippetStartOffset : 5.0;
        this.previewUrl = previewUrl;
        this.active = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getTitleEn() { return titleEn; }
    public void setTitleEn(String titleEn) { this.titleEn = titleEn; }

    public String getTitleHi() { return titleHi; }
    public void setTitleHi(String titleHi) { this.titleHi = titleHi; }

    public Film getFilm() { return film; }
    public void setFilm(Film film) { this.film = film; }

    public Integer getRecordingYear() { return recordingYear; }
    public void setRecordingYear(Integer recordingYear) { this.recordingYear = recordingYear; }

    public String getDecade() { return decade; }
    public void setDecade(String decade) { this.decade = decade; }

    public String getPrimaryGenre() { return primaryGenre; }
    public void setPrimaryGenre(String primaryGenre) { this.primaryGenre = primaryGenre; }

    public String getMoodTags() { return moodTags; }
    public void setMoodTags(String moodTags) { this.moodTags = moodTags; }

    public Integer getTempoBpm() { return tempoBpm; }
    public void setTempoBpm(Integer tempoBpm) { this.tempoBpm = tempoBpm; }

    public String getSignatureRiffNotes() { return signatureRiffNotes; }
    public void setSignatureRiffNotes(String signatureRiffNotes) { this.signatureRiffNotes = signatureRiffNotes; }

    public String getTriviaFact() { return triviaFact; }
    public void setTriviaFact(String triviaFact) { this.triviaFact = triviaFact; }

    public Double getSnippetStartOffset() { return snippetStartOffset != null ? snippetStartOffset : 5.0; }
    public void setSnippetStartOffset(Double snippetStartOffset) { this.snippetStartOffset = snippetStartOffset; }

    public String getPreviewUrl() { return previewUrl; }
    public void setPreviewUrl(String previewUrl) { this.previewUrl = previewUrl; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Song)) return false;
        Song song = (Song) o;
        return Objects.equals(slug, song.slug);
    }

    @Override
    public int hashCode() {
        return Objects.hash(slug);
    }
}
