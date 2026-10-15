package com.surguess.dto;

public class SongAutocompleteDto {
    private Long id;
    private String titleEn;
    private String titleHi;
    private String filmTitleEn;
    private Integer releaseYear;
    private String singers;

    public SongAutocompleteDto() {}

    public SongAutocompleteDto(Long id, String titleEn, String titleHi, String filmTitleEn, Integer releaseYear, String singers) {
        this.id = id;
        this.titleEn = titleEn;
        this.titleHi = titleHi;
        this.filmTitleEn = filmTitleEn;
        this.releaseYear = releaseYear;
        this.singers = singers;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitleEn() { return titleEn; }
    public void setTitleEn(String titleEn) { this.titleEn = titleEn; }
    public String getTitleHi() { return titleHi; }
    public void setTitleHi(String titleHi) { this.titleHi = titleHi; }
    public String getFilmTitleEn() { return filmTitleEn; }
    public void setFilmTitleEn(String filmTitleEn) { this.filmTitleEn = filmTitleEn; }
    public Integer getReleaseYear() { return releaseYear; }
    public void setReleaseYear(Integer releaseYear) { this.releaseYear = releaseYear; }
    public String getSingers() { return singers; }
    public void setSingers(String singers) { this.singers = singers; }
}
