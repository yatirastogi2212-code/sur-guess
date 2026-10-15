package com.surguess.dto;

import java.util.List;

public class SongDetailDto {
    private Long id;
    private String slug;
    private String titleEn;
    private String titleHi;
    private String filmTitleEn;
    private String filmTitleHi;
    private Integer releaseYear;
    private String decade;
    private String primaryGenre;
    private String moodTags;
    private Integer tempoBpm;
    private String signatureRiffNotes;
    private String triviaFact;
    private List<String> singers;
    private List<String> musicDirectors;
    private List<String> lyricists;
    private List<String> aliases;
    private String audioProvider;
    private String rightsStatus;
    private String sourceUrl;
    private Double snippetStartOffset;
    private String previewUrl;
    private boolean playable;
    private boolean active = true;

    public SongDetailDto() {}

    public Double getSnippetStartOffset() { return snippetStartOffset != null ? snippetStartOffset : 5.0; }
    public void setSnippetStartOffset(Double snippetStartOffset) { this.snippetStartOffset = snippetStartOffset; }
    public String getPreviewUrl() { return previewUrl; }
    public void setPreviewUrl(String previewUrl) { this.previewUrl = previewUrl; }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getTitleEn() { return titleEn; }
    public void setTitleEn(String titleEn) { this.titleEn = titleEn; }
    public String getTitleHi() { return titleHi; }
    public void setTitleHi(String titleHi) { this.titleHi = titleHi; }
    public String getFilmTitleEn() { return filmTitleEn; }
    public void setFilmTitleEn(String filmTitleEn) { this.filmTitleEn = filmTitleEn; }
    public String getFilmTitleHi() { return filmTitleHi; }
    public void setFilmTitleHi(String filmTitleHi) { this.filmTitleHi = filmTitleHi; }
    public Integer getReleaseYear() { return releaseYear; }
    public void setReleaseYear(Integer releaseYear) { this.releaseYear = releaseYear; }
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
    public List<String> getSingers() { return singers; }
    public void setSingers(List<String> singers) { this.singers = singers; }
    public List<String> getMusicDirectors() { return musicDirectors; }
    public void setMusicDirectors(List<String> musicDirectors) { this.musicDirectors = musicDirectors; }
    public List<String> getLyricists() { return lyricists; }
    public void setLyricists(List<String> lyricists) { this.lyricists = lyricists; }
    public List<String> getAliases() { return aliases; }
    public void setAliases(List<String> aliases) { this.aliases = aliases; }
    public String getAudioProvider() { return audioProvider; }
    public void setAudioProvider(String audioProvider) { this.audioProvider = audioProvider; }
    public String getRightsStatus() { return rightsStatus; }
    public void setRightsStatus(String rightsStatus) { this.rightsStatus = rightsStatus; }
    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }
    public boolean isPlayable() { return playable; }
    public void setPlayable(boolean playable) { this.playable = playable; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
