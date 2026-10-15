package com.surguess.repository;

import com.surguess.model.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SongRepository extends JpaRepository<Song, Long> {
    Optional<Song> findBySlug(String slug);
    List<Song> findByActiveTrue();
    List<Song> findByDecadeAndActiveTrue(String decade);
    List<Song> findByPrimaryGenreIgnoreCaseAndActiveTrue(String genre);

    @Query("SELECT s FROM Song s WHERE s.active = true AND " +
           "(LOWER(s.titleEn) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "s.titleHi LIKE CONCAT('%', :query, '%') OR " +
           "LOWER(s.film.titleEn) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Song> searchActiveSongs(@Param("query") String query);

    @Query("SELECT s FROM Song s JOIN SongArtistCredit c ON c.song = s WHERE c.artist.id = :artistId AND s.active = true")
    List<Song> findByArtistId(@Param("artistId") Long artistId);
}
