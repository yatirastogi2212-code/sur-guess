package com.surguess.model;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "films", indexes = {
    @Index(name = "idx_film_slug", columnList = "slug", unique = true)
})
public class Film {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String titleEn;

    @Column(nullable = false)
    private String titleHi;

    @Column(nullable = false)
    private Integer releaseYear;

    private String decade;

    private String director;

    private String starring;

    private String bannerUrl;

    public Film() {}

    public Film(String slug, String titleEn, String titleHi, Integer releaseYear, String decade, String director, String starring, String bannerUrl) {
        this.slug = slug;
        this.titleEn = titleEn;
        this.titleHi = titleHi;
        this.releaseYear = releaseYear;
        this.decade = decade;
        this.director = director;
        this.starring = starring;
        this.bannerUrl = bannerUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getTitleEn() { return titleEn; }
    public void setTitleEn(String titleEn) { this.titleEn = titleEn; }

    public String getTitleHi() { return titleHi; }
    public void setTitleHi(String titleHi) { this.titleHi = titleHi; }

    public Integer getReleaseYear() { return releaseYear; }
    public void setReleaseYear(Integer releaseYear) { this.releaseYear = releaseYear; }

    public String getDecade() { return decade; }
    public void setDecade(String decade) { this.decade = decade; }

    public String getDirector() { return director; }
    public void setDirector(String director) { this.director = director; }

    public String getStarring() { return starring; }
    public void setStarring(String starring) { this.starring = starring; }

    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Film)) return false;
        Film film = (Film) o;
        return Objects.equals(slug, film.slug);
    }

    @Override
    public int hashCode() {
        return Objects.hash(slug);
    }
}
