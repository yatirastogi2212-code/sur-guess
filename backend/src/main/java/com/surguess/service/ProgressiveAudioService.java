package com.surguess.service;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProgressiveAudioService {

    // Configurable reveal durations in seconds
    public static final List<Double> REVEAL_DURATIONS = List.of(0.1, 0.5, 1.0, 2.0, 4.0, 8.0, 15.0);

    // Points per stage for a correct identification
    public static final List<Integer> STAGE_BASE_POINTS = List.of(1000, 800, 650, 500, 350, 200, 100);

    public static final int MAX_STAGE = 7;

    public double getDurationForStage(int stage) {
        if (stage < 1) return REVEAL_DURATIONS.get(0);
        if (stage > MAX_STAGE) return REVEAL_DURATIONS.get(MAX_STAGE - 1);
        return REVEAL_DURATIONS.get(stage - 1);
    }

    public int calculatePoints(int stage, double timeElapsedSeconds) {
        if (stage < 1 || stage > MAX_STAGE) return 0;
        int base = STAGE_BASE_POINTS.get(stage - 1);
        // Add up to 50 speed bonus points if answered within 5 seconds of hearing the stage
        int speedBonus = 0;
        if (timeElapsedSeconds > 0 && timeElapsedSeconds < 5.0) {
            speedBonus = (int) Math.round((5.0 - timeElapsedSeconds) * 10);
        }
        return base + speedBonus;
    }

    public boolean isExhausted(int stage) {
        return stage >= MAX_STAGE;
    }

    public double getStartOffset(Double configuredOffset) {
        if (configuredOffset == null || configuredOffset < 0) {
            return 5.0;
        }
        return configuredOffset;
    }

    public double getEndOffset(Double configuredOffset, int stage) {
        return getStartOffset(configuredOffset) + getDurationForStage(stage);
    }
}
