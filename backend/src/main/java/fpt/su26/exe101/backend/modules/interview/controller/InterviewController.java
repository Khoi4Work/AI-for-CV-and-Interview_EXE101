package fpt.su26.exe101.backend.modules.interview.controller;

import fpt.su26.exe101.backend.base.response.ApiResponse;
import fpt.su26.exe101.backend.modules.interview.dto.request.CreateInterviewSessionRequestDTO;
import fpt.su26.exe101.backend.modules.interview.dto.request.SubmitInterviewAnswerRequestDTO;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewAnswerResponseDTO;
import fpt.su26.exe101.backend.modules.interview.dto.response.CreateInterviewSessionResponseDTO;
import fpt.su26.exe101.backend.modules.interview.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/interview")
@RequiredArgsConstructor
public class InterviewController {
    private final InterviewService interviewService;

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
}
