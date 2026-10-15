package com.surguess.controller;

import com.surguess.dto.SongAutocompleteDto;
import com.surguess.dto.SongDetailDto;
import com.surguess.model.Artist;
import com.surguess.model.Film;
import com.surguess.service.CatalogueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogue")
public class CatalogueController {

    private final CatalogueService catalogueService;

    public CatalogueController(CatalogueService catalogueService) {
        this.catalogueService = catalogueService;
    }

    @GetMapping("/songs")
    public List<SongDetailDto> getAllSongs() {
        return catalogueService.getAllActiveSongs();
    }

    @GetMapping("/songs/{id}")
    public ResponseEntity<SongDetailDto> getSongById(@PathVariable Long id) {
        return catalogueService.getSongById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/decades/{decade}")
    public List<SongDetailDto> getSongsByDecade(@PathVariable String decade) {
        return catalogueService.getSongsByDecade(decade);
    }

    @GetMapping("/genres/{genre}")
    public List<SongDetailDto> getSongsByGenre(@PathVariable String genre) {
        return catalogueService.getSongsByGenre(genre);
    }

    @GetMapping("/artists")
    public List<Artist> getAllArtists() {
        return catalogueService.getAllArtists();
    }

    @GetMapping("/artists/{slug}")
    public ResponseEntity<Artist> getArtistBySlug(@PathVariable String slug) {
        return catalogueService.getArtistBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/artists/{slug}/songs")
    public ResponseEntity<List<SongDetailDto>> getSongsByArtistSlug(@PathVariable String slug) {
        return catalogueService.getArtistBySlug(slug)
                .map(artist -> ResponseEntity.ok(catalogueService.getSongsByArtist(artist.getId())))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/films")
    public List<Film> getAllFilms() {
        return catalogueService.getAllFilms();
    }

    @GetMapping("/films/{slug}")
    public ResponseEntity<Film> getFilmBySlug(@PathVariable String slug) {
        return catalogueService.getFilmBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/autocomplete")
    public List<SongAutocompleteDto> autocomplete(@RequestParam(name = "q", defaultValue = "") String query) {
        return catalogueService.autocomplete(query);
    }
}
