package com.surguess.service;

import com.surguess.dto.SongAutocompleteDto;
import com.surguess.dto.SongDetailDto;
import com.surguess.model.*;
import com.surguess.repository.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CatalogueService {

    private final SongRepository songRepository;
    private final FilmRepository filmRepository;
    private final ArtistRepository artistRepository;
    private final SongArtistCreditRepository creditRepository;
    private final SongAliasRepository aliasRepository;
    private final AudioAssetRepository audioAssetRepository;

    public CatalogueService(SongRepository songRepository,
                            FilmRepository filmRepository,
                            ArtistRepository artistRepository,
                            SongArtistCreditRepository creditRepository,
                            SongAliasRepository aliasRepository,
                            AudioAssetRepository audioAssetRepository) {
        this.songRepository = songRepository;
        this.filmRepository = filmRepository;
        this.artistRepository = artistRepository;
        this.creditRepository = creditRepository;
        this.aliasRepository = aliasRepository;
        this.audioAssetRepository = audioAssetRepository;
    }

    public List<SongDetailDto> getAllActiveSongs() {
        return songRepository.findByActiveTrue().stream()
                .map(this::mapToDetailDto)
                .collect(Collectors.toList());
    }

    public Optional<SongDetailDto> getSongById(Long id) {
        return songRepository.findById(id).map(this::mapToDetailDto);
    }

    public Optional<SongDetailDto> getSongBySlug(String slug) {
        return songRepository.findBySlug(slug).map(this::mapToDetailDto);
    }

    public List<SongDetailDto> getSongsByDecade(String decade) {
        return songRepository.findByDecadeAndActiveTrue(decade).stream()
                .map(this::mapToDetailDto)
                .collect(Collectors.toList());
    }

    public List<SongDetailDto> getSongsByGenre(String genre) {
        return songRepository.findByPrimaryGenreIgnoreCaseAndActiveTrue(genre).stream()
                .map(this::mapToDetailDto)
                .collect(Collectors.toList());
    }

    public List<SongDetailDto> getSongsByArtist(Long artistId) {
        return songRepository.findByArtistId(artistId).stream()
                .map(this::mapToDetailDto)
                .collect(Collectors.toList());
    }

    public List<SongAutocompleteDto> autocomplete(String query) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }
        return songRepository.searchActiveSongs(query.trim()).stream()
                .limit(10)
                .map(this::mapToAutocompleteDto)
                .collect(Collectors.toList());
    }

    public List<Artist> getAllArtists() {
        return artistRepository.findAll();
    }

    public Optional<Artist> getArtistBySlug(String slug) {
        return artistRepository.findBySlug(slug);
    }

    public List<Film> getAllFilms() {
        return filmRepository.findAll();
    }

    public Optional<Film> getFilmBySlug(String slug) {
        return filmRepository.findBySlug(slug);
    }

    public SongDetailDto mapToDetailDto(Song song) {
        SongDetailDto dto = new SongDetailDto();
        dto.setId(song.getId());
        dto.setSlug(song.getSlug());
        dto.setTitleEn(song.getTitleEn());
        dto.setTitleHi(song.getTitleHi());
        if (song.getFilm() != null) {
            dto.setFilmTitleEn(song.getFilm().getTitleEn());
            dto.setFilmTitleHi(song.getFilm().getTitleHi());
            dto.setReleaseYear(song.getFilm().getReleaseYear());
        } else {
            dto.setReleaseYear(song.getRecordingYear());
        }
        dto.setDecade(song.getDecade());
        dto.setPrimaryGenre(song.getPrimaryGenre());
        dto.setMoodTags(song.getMoodTags());
        dto.setTempoBpm(song.getTempoBpm());
        dto.setSignatureRiffNotes(song.getSignatureRiffNotes());
        dto.setTriviaFact(song.getTriviaFact());
        dto.setActive(song.isActive());

        // Credits
        List<SongArtistCredit> credits = creditRepository.findBySongId(song.getId());
        List<String> singers = new ArrayList<>();
        List<String> musicDirectors = new ArrayList<>();
        List<String> lyricists = new ArrayList<>();

        for (SongArtistCredit credit : credits) {
            String name = credit.getArtist().getNameEn() + " (" + credit.getArtist().getNameHi() + ")";
            if (credit.getCreditRole() == CreditRole.PLAYBACK_SINGER || credit.getCreditRole() == CreditRole.FEATURED_ARTIST) {
                singers.add(name);
            } else if (credit.getCreditRole() == CreditRole.MUSIC_DIRECTOR) {
                musicDirectors.add(name);
            } else if (credit.getCreditRole() == CreditRole.LYRICIST) {
                lyricists.add(name);
            }
        }
        dto.setSingers(singers);
        dto.setMusicDirectors(musicDirectors);
        dto.setLyricists(lyricists);

        // Aliases
        List<String> aliases = aliasRepository.findBySongId(song.getId()).stream()
                .map(SongAlias::getAliasText)
                .collect(Collectors.toList());
        dto.setAliases(aliases);

        dto.setSnippetStartOffset(song.getSnippetStartOffset() != null ? song.getSnippetStartOffset() : 5.0);
        String songPreview = song.getPreviewUrl();

        // Audio Asset
        Optional<AudioAsset> audioOpt = audioAssetRepository.findBySongId(song.getId());
        if (audioOpt.isPresent()) {
            AudioAsset audio = audioOpt.get();
            dto.setAudioProvider(audio.getProvider().name());
            dto.setRightsStatus(audio.getRightsStatus().name());
            String effectiveUrl = audio.getSourceUrl() != null ? audio.getSourceUrl() : songPreview;
            dto.setSourceUrl(effectiveUrl);
            dto.setPreviewUrl(effectiveUrl);
            dto.setPlayable(audio.isPlayable());
        } else {
            dto.setAudioProvider(songPreview != null ? AudioProviderType.LICENSED_STREAM.name() : AudioProviderType.WEB_AUDIO_SYNTH.name());
            dto.setRightsStatus(songPreview != null ? AudioRightsStatus.LICENSED.name() : AudioRightsStatus.APPROVED_SYNTHETIC.name());
            dto.setSourceUrl(songPreview);
            dto.setPreviewUrl(songPreview);
            dto.setPlayable(true);
        }

        return dto;
    }

    public SongAutocompleteDto mapToAutocompleteDto(Song song) {
        List<SongArtistCredit> credits = creditRepository.findBySongId(song.getId());
        String singers = credits.stream()
                .filter(c -> c.getCreditRole() == CreditRole.PLAYBACK_SINGER)
                .map(c -> c.getArtist().getNameEn())
                .collect(Collectors.joining(", "));
        String filmTitle = song.getFilm() != null ? song.getFilm().getTitleEn() : "Single";
        int year = song.getFilm() != null ? song.getFilm().getReleaseYear() : song.getRecordingYear();

        return new SongAutocompleteDto(
                song.getId(),
                song.getTitleEn(),
                song.getTitleHi(),
                filmTitle,
                year,
                singers
        );
    }
}
