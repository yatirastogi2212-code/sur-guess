package com.surguess.repository;

import com.surguess.model.Film;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FilmRepository extends JpaRepository<Film, Long> {
    Optional<Film> findBySlug(String slug);
    List<Film> findByDecade(String decade);
}
