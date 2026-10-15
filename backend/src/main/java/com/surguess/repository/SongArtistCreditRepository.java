package com.surguess.repository;

import com.surguess.model.SongArtistCredit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SongArtistCreditRepository extends JpaRepository<SongArtistCredit, Long> {
    List<SongArtistCredit> findBySongId(Long songId);
    List<SongArtistCredit> findByArtistId(Long artistId);
}
