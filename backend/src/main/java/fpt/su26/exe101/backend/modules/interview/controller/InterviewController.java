package fpt.su26.exe101.backend.modules.interview.controller;

import fpt.su26.exe101.backend.base.response.ApiResponse;
import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.interview.dto.request.CreateInterviewSessionRequestDTO;
import fpt.su26.exe101.backend.modules.interview.dto.request.SubmitInterviewAnswerRequestDTO;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewAnswerResponseDTO;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewEvaluationResponseDTO;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewSessionDetailResponseDTO;
import fpt.su26.exe101.backend.modules.interview.dto.response.CreateInterviewSessionResponseDTO;
import fpt.su26.exe101.backend.modules.interview.service.InterviewService;
import fpt.su26.exe101.backend.modules.interview.service.InterviewVoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/interview")
@RequiredArgsConstructor
public class InterviewController {
    private static final long MAX_ANSWER_AUDIO_SIZE = 5L * 1024 * 1024;
    private final InterviewService interviewService;
    private final InterviewVoiceService interviewVoiceService;

    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<CreateInterviewSessionResponseDTO>> createSession(
            @Valid @RequestBody CreateInterviewSessionRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(interviewService.createSession(request), "Interview session created"));
    }

    @PostMapping("/sessions/{sessionId}/answers")
    public ResponseEntity<ApiResponse<InterviewAnswerResponseDTO>> submitAnswer(
            @PathVariable UUID sessionId,
            @Valid @RequestBody SubmitInterviewAnswerRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.success(interviewService.submitAnswer(sessionId, request), "Interview answer saved"));
    }

    @PostMapping(value = "/sessions/{sessionId}/answers/audio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<InterviewAnswerResponseDTO>> submitAudioAnswer(
            @PathVariable UUID sessionId,
            @RequestParam UUID questionId,
            @RequestPart("audio") MultipartFile audio) throws java.io.IOException {
        if (audio.isEmpty()) throw new ApiException(ErrorCode.INVALID_INPUT, "Audio file must not be empty.");
        if (audio.getSize() > MAX_ANSWER_AUDIO_SIZE) throw new ApiException(
                ErrorCode.INVALID_INPUT, "Audio file must not exceed 5 MB.");
        String contentType = audio.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("audio/")) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Only audio files are supported.");
        }
        return ResponseEntity.ok(ApiResponse.success(interviewService.submitAudioAnswer(
                sessionId, questionId, audio.getBytes(), audio.getOriginalFilename(), contentType),
                "Audio transcribed and answer saved"));
    }

    @PostMapping("/sessions/{sessionId}/finish")
    public ResponseEntity<ApiResponse<Void>> finishSession(@PathVariable UUID sessionId) {
        interviewService.finishSession(sessionId);
        return ResponseEntity.ok(ApiResponse.success(null, "Interview session finished"));
    }

    @PostMapping("/sessions/{sessionId}/evaluate")
    public ResponseEntity<ApiResponse<InterviewEvaluationResponseDTO>> evaluateSession(
            @PathVariable UUID sessionId) {
        return ResponseEntity.ok(ApiResponse.success(interviewService.evaluateSession(sessionId), "Interview evaluated"));
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<InterviewSessionDetailResponseDTO>> getSessionDetail(
            @PathVariable UUID sessionId) {
        return ResponseEntity.ok(ApiResponse.success(interviewService.getSessionDetail(sessionId)));
    }

    @GetMapping("/questions/{questionId}/audio")
    public ResponseEntity<byte[]> getQuestionAudio(@PathVariable UUID questionId) {
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf("audio/mpeg"))
                .body(interviewVoiceService.synthesizeQuestionAudio(questionId));
    }
}
