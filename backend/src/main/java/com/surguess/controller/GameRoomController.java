package com.surguess.controller;

import com.surguess.dto.RoomStateDto;
import com.surguess.model.GameMode;
import com.surguess.service.GameRoomService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rooms")
public class GameRoomController {

    private final GameRoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;

    public GameRoomController(GameRoomService roomService, SimpMessagingTemplate messagingTemplate) {
        this.roomService = roomService;
        this.messagingTemplate = messagingTemplate;
    }

    public static class CreateRoomRequest {
        public String playerId;
        public String nickname;
        public String mode = "PROGRESSIVE";
        public int questions = 5;
    }

    public static class JoinRoomRequest {
        public String roomCode;
        public String playerId;
        public String nickname;
    }

    public static class GuessRoomRequest {
        public String playerId;
        public String guess;
        public double timeElapsedSeconds;
    }

    public static class AdvanceRoomRequest {
        public String playerId;
        public boolean skipStage;
    }

    @PostMapping("/create")
    public RoomStateDto createRoom(@RequestBody CreateRoomRequest req) {
        GameMode mode;
        try {
            mode = GameMode.valueOf(req.mode.toUpperCase());
        } catch (Exception e) {
            mode = GameMode.PROGRESSIVE;
        }
        RoomStateDto state = roomService.createRoom(req.playerId, req.nickname, mode, req.questions);
        notifyRoom(state.getRoomCode(), state);
        return state;
    }

    @PostMapping("/join")
    public RoomStateDto joinRoom(@RequestBody JoinRoomRequest req) {
        RoomStateDto state = roomService.joinRoom(req.roomCode, req.playerId, req.nickname);
        notifyRoom(state.getRoomCode(), state);
        return state;
    }

    @PostMapping("/leave")
    public RoomStateDto leaveRoom(@RequestParam String roomCode, @RequestParam String playerId) {
        RoomStateDto state = roomService.leaveRoom(roomCode, playerId);
        notifyRoom(roomCode, state);
        return state;
    }

    @GetMapping("/{code}")
    public RoomStateDto getRoom(@PathVariable String code) {
        return roomService.getRoomState(code);
    }

    @PostMapping("/{code}/start")
    public RoomStateDto startGame(@PathVariable String code, @RequestParam String playerId) {
        RoomStateDto state = roomService.startGame(code, playerId);
        notifyRoom(code, state);
        return state;
    }

    @PostMapping("/{code}/guess")
    public RoomStateDto submitGuess(@PathVariable String code, @RequestBody GuessRoomRequest req) {
        RoomStateDto state = roomService.submitGuess(code, req.playerId, req.guess, req.timeElapsedSeconds);
        notifyRoom(code, state);
        return state;
    }

    @PostMapping("/{code}/advance")
    public RoomStateDto advanceStage(@PathVariable String code, @RequestBody AdvanceRoomRequest req) {
        RoomStateDto state = roomService.advanceStageOrNextQuestion(code, req.playerId, req.skipStage);
        notifyRoom(code, state);
        return state;
    }

    private void notifyRoom(String roomCode, RoomStateDto state) {
        if (roomCode != null) {
            messagingTemplate.convertAndSend("/topic/room/" + roomCode.toUpperCase(), state);
        }
    }
}
