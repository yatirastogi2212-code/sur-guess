package com.surguess.repository;

import com.surguess.model.Artist;
import com.surguess.model.ArtistType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArtistRepository extends JpaRepository<Artist, Long> {
    Optional<Artist> findBySlug(String slug);
    List<Artist> findByType(ArtistType type);
    List<Artist> findByActiveEraContainingIgnoreCase(String era);
}
