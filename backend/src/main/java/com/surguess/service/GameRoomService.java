package com.surguess.service;

import com.surguess.dto.PlayerScoreDto;
import com.surguess.dto.RoomStateDto;
import com.surguess.dto.SongDetailDto;
import com.surguess.model.GameMode;
import com.surguess.model.GameRoom;
import com.surguess.model.PlayerSession;
import com.surguess.model.Song;
import com.surguess.repository.GameRoomRepository;
import com.surguess.repository.PlayerSessionRepository;
import com.surguess.repository.SongRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GameRoomService {

    private final GameRoomRepository roomRepository;
    private final PlayerSessionRepository playerRepository;
    private final SongRepository songRepository;
    private final MatchingService matchingService;
    private final ProgressiveAudioService progressiveAudioService;
    private final CatalogueService catalogueService;

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final List<String> AVATAR_COLORS = List.of(
            "#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4"
    );

    public GameRoomService(GameRoomRepository roomRepository,
                           PlayerSessionRepository playerRepository,
                           SongRepository songRepository,
                           MatchingService matchingService,
                           ProgressiveAudioService progressiveAudioService,
                           CatalogueService catalogueService) {
        this.roomRepository = roomRepository;
        this.playerRepository = playerRepository;
        this.songRepository = songRepository;
        this.matchingService = matchingService;
        this.progressiveAudioService = progressiveAudioService;
        this.catalogueService = catalogueService;
    }

    @Transactional
    public RoomStateDto createRoom(String hostPlayerId, String nickname, GameMode mode, int questions) {
        String code = generateUniqueCode();
        GameRoom room = new GameRoom(code, hostPlayerId, mode != null ? mode : GameMode.PROGRESSIVE, questions > 0 ? questions : 5);
        roomRepository.save(room);

        PlayerSession hostPlayer = new PlayerSession(code, hostPlayerId, nickname, true, AVATAR_COLORS.get(0));
        playerRepository.save(hostPlayer);

        return getRoomState(code);
    }

    @Transactional
    public RoomStateDto joinRoom(String roomCode, String playerId, String nickname) {
        String cleanCode = roomCode.trim().toUpperCase();
        GameRoom room = roomRepository.findByRoomCode(cleanCode)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + cleanCode));

        Optional<PlayerSession> existing = playerRepository.findByRoomCodeAndPlayerId(cleanCode, playerId);
        if (existing.isEmpty()) {
            List<PlayerSession> currentPlayers = playerRepository.findByRoomCodeOrderByScoreDesc(cleanCode);
            String color = AVATAR_COLORS.get(currentPlayers.size() % AVATAR_COLORS.size());
            PlayerSession session = new PlayerSession(cleanCode, playerId, nickname, false, color);
            playerRepository.save(session);
        }

        return getRoomState(cleanCode);
    }

    @Transactional
    public RoomStateDto leaveRoom(String roomCode, String playerId) {
        String cleanCode = roomCode.trim().toUpperCase();
        playerRepository.deleteByRoomCodeAndPlayerId(cleanCode, playerId);

        List<PlayerSession> remaining = playerRepository.findByRoomCodeOrderByScoreDesc(cleanCode);
        if (remaining.isEmpty()) {
            roomRepository.deleteById(cleanCode);
            RoomStateDto closed = new RoomStateDto();
            closed.setRoomCode(cleanCode);
            closed.setStatus("CLOSED");
            return closed;
        }

        GameRoom room = roomRepository.findByRoomCode(cleanCode).orElse(null);
        if (room != null && room.getHostPlayerId().equals(playerId)) {
            // Assign next player as host
            PlayerSession newHost = remaining.get(0);
            newHost.setHost(true);
            playerRepository.save(newHost);
            room.setHostPlayerId(newHost.getPlayerId());
            roomRepository.save(room);
        }

        return getRoomState(cleanCode);
    }

    @Transactional
    public RoomStateDto startGame(String roomCode, String playerId) {
        String cleanCode = roomCode.trim().toUpperCase();
        GameRoom room = roomRepository.findByRoomCode(cleanCode)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        if (!room.getHostPlayerId().equals(playerId)) {
            throw new IllegalStateException("Only host can start the game");
        }

        List<Song> allSongs = songRepository.findByActiveTrue();
        Collections.shuffle(allSongs);
        List<Song> selected = allSongs.stream().limit(room.getTotalQuestions()).collect(Collectors.toList());

        String songIds = selected.stream().map(s -> String.valueOf(s.getId())).collect(Collectors.joining(","));
        room.setSongSequenceIds(songIds);
        room.setCurrentQuestionIndex(0);
        room.setCurrentStage(1);
        room.setCurrentSongId(selected.get(0).getId());
        room.setStatus("PLAYING");
        roomRepository.save(room);

        // Reset player answers
        List<PlayerSession> players = playerRepository.findByRoomCodeOrderByScoreDesc(cleanCode);
        for (PlayerSession p : players) {
            p.setAnswered(false);
            p.setScore(0);
            playerRepository.save(p);
        }

        return getRoomState(cleanCode);
    }

    @Transactional
    public RoomStateDto submitGuess(String roomCode, String playerId, String guess, double timeElapsedSeconds) {
        String cleanCode = roomCode.trim().toUpperCase();
        GameRoom room = roomRepository.findByRoomCode(cleanCode)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        if (!"PLAYING".equals(room.getStatus())) {
            return getRoomState(cleanCode);
        }

        PlayerSession player = playerRepository.findByRoomCodeAndPlayerId(cleanCode, playerId)
                .orElseThrow(() -> new IllegalArgumentException("Player not in room"));

        if (player.isAnswered()) {
            return getRoomState(cleanCode); // Already answered this round
        }

        Song currentSong = songRepository.findById(room.getCurrentSongId()).orElse(null);
        if (currentSong == null) return getRoomState(cleanCode);

        boolean match = matchingService.matchesSong(guess, currentSong);
        if (match) {
            int pts = progressiveAudioService.calculatePoints(room.getCurrentStage(), timeElapsedSeconds);
            player.setScore(player.getScore() + pts);
            player.setAnswered(true);
            playerRepository.save(player);
        }

        // Check if all players answered
        List<PlayerSession> players = playerRepository.findByRoomCodeOrderByScoreDesc(cleanCode);
        boolean allAnswered = players.stream().allMatch(PlayerSession::isAnswered);

        if (allAnswered) {
            room.setStatus("ROUND_OVER");
            roomRepository.save(room);
        }

        return getRoomState(cleanCode);
    }

    @Transactional
    public RoomStateDto advanceStageOrNextQuestion(String roomCode, String playerId, boolean skipStage) {
        String cleanCode = roomCode.trim().toUpperCase();
        GameRoom room = roomRepository.findByRoomCode(cleanCode)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        if (!room.getHostPlayerId().equals(playerId)) {
            throw new IllegalStateException("Only host can advance round/stage");
        }

        if (skipStage && "PLAYING".equals(room.getStatus())) {
            if (progressiveAudioService.isExhausted(room.getCurrentStage())) {
                room.setStatus("ROUND_OVER");
            } else {
                room.setCurrentStage(room.getCurrentStage() + 1);
            }
            roomRepository.save(room);
            return getRoomState(cleanCode);
        }

        // Advance to next question
        int nextIndex = room.getCurrentQuestionIndex() + 1;
        if (nextIndex >= room.getTotalQuestions()) {
            room.setStatus("GAME_OVER");
        } else {
            String[] ids = room.getSongSequenceIds().split(",");
            room.setCurrentQuestionIndex(nextIndex);
            room.setCurrentSongId(Long.parseLong(ids[nextIndex].trim()));
            room.setCurrentStage(1);
            room.setStatus("PLAYING");

            // Reset player answered flags
            List<PlayerSession> players = playerRepository.findByRoomCodeOrderByScoreDesc(cleanCode);
            for (PlayerSession p : players) {
                p.setAnswered(false);
                playerRepository.save(p);
            }
        }

        roomRepository.save(room);
        return getRoomState(cleanCode);
    }

    public RoomStateDto getRoomState(String roomCode) {
        String cleanCode = roomCode.trim().toUpperCase();
        GameRoom room = roomRepository.findByRoomCode(cleanCode)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + cleanCode));

        RoomStateDto dto = new RoomStateDto();
        dto.setRoomCode(room.getRoomCode());
        dto.setHostPlayerId(room.getHostPlayerId());
        dto.setStatus(room.getStatus());
        dto.setGameMode(room.getGameMode().name());
        dto.setCurrentQuestionIndex(room.getCurrentQuestionIndex());
        dto.setTotalQuestions(room.getTotalQuestions());
        dto.setCurrentStage(room.getCurrentStage());
        dto.setCurrentDurationSeconds(progressiveAudioService.getDurationForStage(room.getCurrentStage()));

        if (room.getCurrentSongId() != null) {
            Song song = songRepository.findById(room.getCurrentSongId()).orElse(null);
            if (song != null) {
                dto.setSignatureRiffNotes(song.getSignatureRiffNotes());
                SongDetailDto detail = catalogueService.mapToDetailDto(song);
                dto.setSourceUrl(detail.getSourceUrl());
                dto.setPreviewUrl(detail.getPreviewUrl());
                dto.setSnippetStartOffset(song.getSnippetStartOffset() != null ? song.getSnippetStartOffset() : 5.0);

                // Reveal song metadata only when round is over or game is over
                if ("ROUND_OVER".equals(room.getStatus()) || "GAME_OVER".equals(room.getStatus())) {
                    dto.setRevealedSong(detail);
                }
            }
        }

        List<PlayerScoreDto> playerDtos = playerRepository.findByRoomCodeOrderByScoreDesc(cleanCode).stream()
                .map(p -> new PlayerScoreDto(p.getPlayerId(), p.getNickname(), p.getScore(), p.isAnswered(), p.isHost(), p.getAvatarColor()))
                .collect(Collectors.toList());
        dto.setPlayers(playerDtos);

        return dto;
    }

    private String generateUniqueCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
            }
            code = sb.toString();
        } while (roomRepository.findByRoomCode(code).isPresent());
        return code;
    }
}
