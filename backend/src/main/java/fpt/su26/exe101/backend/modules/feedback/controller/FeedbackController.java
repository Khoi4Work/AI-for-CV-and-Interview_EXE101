package fpt.su26.exe101.backend.modules.feedback.controller;

import fpt.su26.exe101.backend.modules.feedback.dto.request.FeedbackRequest;
import fpt.su26.exe101.backend.modules.feedback.entity.Feedback;
import fpt.su26.exe101.backend.modules.feedback.service.FeedbackService;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.base.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
@Tag(name = "Feedback API", description = "API for managing user feedbacks and images")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @Operation(summary = "Upload feedback with image", description = "Uploads a user's feedback along with an optional image to Cloudinary and saves it to DB")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Feedback>> createFeedback(
            @ModelAttribute FeedbackRequest request,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        try {
            Feedback feedback = feedbackService.createFeedback(request, imageFile);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(feedback, "Feedback created"));
        } catch (IOException e) {
            log.error("[FEEDBACK] Request failed while saving feedback | errorType={}",
                    e.getClass().getSimpleName(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error(
                    ErrorCode.UNEXPECTED_ERROR.getCode(), "Unable to save feedback.", null));
        }
    }

    @Operation(summary = "Get all feedbacks", description = "Returns a list of all stored user feedbacks")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Feedback>>> getAllFeedbacks() {
        List<Feedback> all = feedbackService.getAllFeedbacks();
        return ResponseEntity.ok(ApiResponse.success(all));
    }
}
