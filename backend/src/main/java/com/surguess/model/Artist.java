package com.surguess.model;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "artists", indexes = {
    @Index(name = "idx_artist_slug", columnList = "slug", unique = true)
})
public class Artist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String nameEn;

    @Column(nullable = false)
    private String nameHi;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ArtistType type;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private Integer debutYear;

    private String activeEra;

    private String imageUrl;

    private boolean verified = true;

    public Artist() {}

    public Artist(String slug, String nameEn, String nameHi, ArtistType type, String bio, Integer debutYear, String activeEra, String imageUrl) {
        this.slug = slug;
        this.nameEn = nameEn;
        this.nameHi = nameHi;
        this.type = type;
        this.bio = bio;
        this.debutYear = debutYear;
        this.activeEra = activeEra;
        this.imageUrl = imageUrl;
        this.verified = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getNameEn() { return nameEn; }
    public void setNameEn(String nameEn) { this.nameEn = nameEn; }

    public String getNameHi() { return nameHi; }
    public void setNameHi(String nameHi) { this.nameHi = nameHi; }

    public ArtistType getType() { return type; }
    public void setType(ArtistType type) { this.type = type; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public Integer getDebutYear() { return debutYear; }
    public void setDebutYear(Integer debutYear) { this.debutYear = debutYear; }

    public String getActiveEra() { return activeEra; }
    public void setActiveEra(String activeEra) { this.activeEra = activeEra; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Artist)) return false;
        Artist artist = (Artist) o;
        return Objects.equals(slug, artist.slug);
    }

    @Override
    public int hashCode() {
        return Objects.hash(slug);
    }
}
