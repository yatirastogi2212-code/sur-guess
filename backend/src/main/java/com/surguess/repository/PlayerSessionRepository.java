package com.surguess.repository;

import com.surguess.model.PlayerSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerSessionRepository extends JpaRepository<PlayerSession, Long> {
    List<PlayerSession> findByRoomCodeOrderByScoreDesc(String roomCode);
    Optional<PlayerSession> findByRoomCodeAndPlayerId(String roomCode, String playerId);
    void deleteByRoomCodeAndPlayerId(String roomCode, String playerId);
}
