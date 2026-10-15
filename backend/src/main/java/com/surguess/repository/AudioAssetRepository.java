package com.surguess.repository;

import com.surguess.model.AudioAsset;
import com.surguess.model.AudioRightsStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AudioAssetRepository extends JpaRepository<AudioAsset, Long> {
    Optional<AudioAsset> findBySongId(Long songId);
    List<AudioAsset> findByRightsStatus(AudioRightsStatus status);
    List<AudioAsset> findByPlayableTrue();
}
