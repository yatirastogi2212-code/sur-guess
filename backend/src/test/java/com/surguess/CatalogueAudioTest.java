package com.surguess;

import com.surguess.dto.QuizQuestionDto;
import com.surguess.dto.SongDetailDto;
import com.surguess.model.GameMode;
import com.surguess.model.Song;
import com.surguess.repository.SongRepository;
import com.surguess.service.CatalogueService;
import com.surguess.service.QuizService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class CatalogueAudioTest {

    @Autowired
    private SongRepository songRepository;

    @Autowired
    private CatalogueService catalogueService;

    @Autowired
    private QuizService quizService;

    @Test
    void testCatalogueHasModernHitsAndRealAudio() {
        List<Song> songs = songRepository.findAll();
        assertFalse(songs.isEmpty(), "Catalogue should have seeded songs");
        assertTrue(songs.size() >= 25, "Catalogue should contain at least 25 songs, found: " + songs.size());

        // Verify modern hits are in the catalogue
        List<String> requiredModernHits = List.of(
                "kesariya",
                "chaleya",
                "tauba-tauba",
                "pehle-bhi-main",
                "apna-bana-le",
                "tum-hi-ho",
                "channa-mereya"
        );

        for (String slug : requiredModernHits) {
            Optional<Song> opt = songRepository.findBySlug(slug);
            assertTrue(opt.isPresent(), "Expected modern blockbuster song not found: " + slug);
            Song song = opt.get();

            // Verify non-zero start offset
            assertNotNull(song.getSnippetStartOffset(), "Song should have snippetStartOffset: " + slug);
            assertTrue(song.getSnippetStartOffset() >= 3.0, "Snippet offset should start at hook (>= 3.0s): " + slug);

            // Verify preview stream URL
            assertNotNull(song.getPreviewUrl(), "Song should have valid preview stream URL: " + slug);
            assertTrue(song.getPreviewUrl().startsWith("https://"), "Preview URL should be HTTPS audio stream: " + slug);
        }
    }

    @Test
    void testQuestionDtoIncludesSnippetOffsetAndRealAudio() {
        QuizQuestionDto question = quizService.startSession(GameMode.PROGRESSIVE, "decade", "2020s", 5);
        assertNotNull(question);
        assertNotNull(question.getSnippetStartOffset(), "Question DTO must have snippetStartOffset");
        assertTrue(question.getSnippetStartOffset() > 0, "Question DTO snippetStartOffset must be > 0s");
        assertNotNull(question.getSourceUrl(), "Question DTO must have sourceUrl");
        assertTrue(question.getSourceUrl().startsWith("https://"), "Question DTO sourceUrl must be HTTPS preview stream");
    }

    @Test
    void testSongDetailDtoIncludesRealAudioAndOffset() {
        Optional<Song> kesariyaOpt = songRepository.findBySlug("kesariya");
        assertTrue(kesariyaOpt.isPresent());

        SongDetailDto detail = catalogueService.mapToDetailDto(kesariyaOpt.get());
        assertNotNull(detail);
        assertEquals(7.0, detail.getSnippetStartOffset());
        assertNotNull(detail.getPreviewUrl());
        assertTrue(detail.getPreviewUrl().contains("itunes.apple.com") || detail.getPreviewUrl().startsWith("https://"));
        assertTrue(detail.isPlayable());
    }
}
