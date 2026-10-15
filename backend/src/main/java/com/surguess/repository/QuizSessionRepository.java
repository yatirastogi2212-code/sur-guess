package com.surguess.repository;

import com.surguess.model.QuizSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuizSessionRepository extends JpaRepository<QuizSession, Long> {
    Optional<QuizSession> findBySessionToken(String sessionToken);
}
