package com.surguess;

import com.surguess.service.ProgressiveAudioService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ProgressiveAudioServiceTest {

    private final ProgressiveAudioService service = new ProgressiveAudioService();

    @Test
    void testDurationProgression() {
        assertEquals(0.1, service.getDurationForStage(1));
        assertEquals(0.5, service.getDurationForStage(2));
        assertEquals(1.0, service.getDurationForStage(3));
        assertEquals(2.0, service.getDurationForStage(4));
        assertEquals(4.0, service.getDurationForStage(5));
        assertEquals(8.0, service.getDurationForStage(6));
        assertEquals(15.0, service.getDurationForStage(7));
    }

    @Test
    void testBoundaryStages() {
        assertEquals(0.1, service.getDurationForStage(0));
        assertEquals(15.0, service.getDurationForStage(10));
    }

    @Test
    void testPointsCalculation() {
        // Stage 1 gives 1000 base points
        int pts1 = service.calculatePoints(1, 0.0);
        assertEquals(1000, pts1);

        // Stage 1 with fast answer under 5s gets speed bonus
        int ptsFast = service.calculatePoints(1, 1.0);
        assertTrue(ptsFast > 1000);

        // Stage 7 gives 100 base points
        int pts7 = service.calculatePoints(7, 0.0);
        assertEquals(100, pts7);

        // Invalid stage gives 0
        assertEquals(0, service.calculatePoints(8, 0.0));
    }

    @Test
    void testExhaustion() {
        assertFalse(service.isExhausted(1));
        assertFalse(service.isExhausted(6));
        assertTrue(service.isExhausted(7));
        assertTrue(service.isExhausted(8));
    }

    @Test
    void testSnippetOffsetAndWindowCalculation() {
        // Song with configured hook offset of 8.0 seconds (e.g. Pehle Bhi Main or Kesariya)
        double configuredOffset = 8.0;
        assertEquals(8.0, service.getStartOffset(configuredOffset));

        // Stage 1: 0.1s slice starting at offset (8.0 to 8.1s)
        assertEquals(8.1, service.getEndOffset(configuredOffset, 1), 0.001);

        // Stage 2: 0.5s slice starting at offset (8.0 to 8.5s)
        assertEquals(8.5, service.getEndOffset(configuredOffset, 2), 0.001);

        // Stage 3: 1.0s slice starting at offset (8.0 to 9.0s)
        assertEquals(9.0, service.getEndOffset(configuredOffset, 3), 0.001);

        // Stage 7: 15.0s slice starting at offset (8.0 to 23.0s)
        assertEquals(23.0, service.getEndOffset(configuredOffset, 7), 0.001);

        // Default fallback offset when null or negative
        assertEquals(5.0, service.getStartOffset(null));
        assertEquals(5.0, service.getStartOffset(-1.0));
        assertEquals(5.1, service.getEndOffset(null, 1), 0.001);
    }
}
