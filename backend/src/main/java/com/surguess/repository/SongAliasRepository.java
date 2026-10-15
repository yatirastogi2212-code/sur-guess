package com.surguess.repository;

import com.surguess.model.SongAlias;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SongAliasRepository extends JpaRepository<SongAlias, Long> {
    List<SongAlias> findBySongId(Long songId);
    List<SongAlias> findByAliasTextIgnoreCase(String aliasText);
}
