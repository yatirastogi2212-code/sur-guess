package com.surguess;

import com.surguess.model.Song;
import com.surguess.model.SongAlias;
import com.surguess.repository.SongAliasRepository;
import com.surguess.service.MatchingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class MatchingServiceTest {

    private SongAliasRepository aliasRepository;
    private MatchingService matchingService;

    @BeforeEach
    void setUp() {
        aliasRepository = Mockito.mock(SongAliasRepository.class);
        matchingService = new MatchingService(aliasRepository);
    }

    @Test
    void testExactEnglishMatchCaseInsensitive() {
        Song song = new Song("tujhe-dekha-to", "Tujhe Dekha Toh", "तुझे देखा तो", null, 1995, "1990s", "Romantic", "Iconic", 86, null, null);
        song.setId(1L);

        assertTrue(matchingService.matchesSong("tujhe dekha toh", song));
        assertTrue(matchingService.matchesSong("TUJHE DEKHA TOH", song));
        assertTrue(matchingService.matchesSong("  Tujhe   Dekha   Toh  ", song));
    }

    @Test
    void testExactDevanagariMatch() {
        Song song = new Song("tujhe-dekha-to", "Tujhe Dekha Toh", "तुझे देखा तो", null, 1995, "1990s", "Romantic", "Iconic", 86, null, null);
        song.setId(1L);

        assertTrue(matchingService.matchesSong("तुझे देखा तो", song));
    }

    @Test
    void testAliasMatch() {
        Song song = new Song("tujhe-dekha-to", "Tujhe Dekha Toh", "तुझे देखा तो", null, 1995, "1990s", "Romantic", "Iconic", 86, null, null);
        song.setId(1L);

        when(aliasRepository.findBySongId(1L)).thenReturn(List.of(
                new SongAlias(song, "Tujhe Dekha To Ye Jaana Sanam", "LATIN"),
                new SongAlias(song, "Tujhe Dekha To", "LATIN")
        ));

        assertTrue(matchingService.matchesSong("Tujhe Dekha To", song));
        assertTrue(matchingService.matchesSong("Tujhe Dekha To Ye Jaana Sanam", song));
    }

    @Test
    void testConservativeLevenshteinTolerance() {
        Song song = new Song("channa-mereya", "Channa Mereya", "चन्ना मेरेया", null, 2016, "2010s", "Romantic", "Sad", 74, null, null);
        song.setId(2L);

        // 1 typo distance on 13-character string: "Channa Mereyaa"
        assertTrue(matchingService.matchesSong("Channa Mereyaa", song));
        // Unrelated string should fail
        assertFalse(matchingService.matchesSong("Kabira", song));
        assertFalse(matchingService.matchesSong("Chaiyya Chaiyya", song));
    }

    @Test
    void testUnicodeNormalization() {
        String raw = "Pya\u0301ar   Hua--Iqraar!! Hua  ";
        String normalized = MatchingService.normalize(raw);
        assertEquals("pyaar hua iqraar hua", normalized);
    }
}
