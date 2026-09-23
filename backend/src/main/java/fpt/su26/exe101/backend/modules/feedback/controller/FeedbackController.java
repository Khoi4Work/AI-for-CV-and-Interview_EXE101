package fpt.su26.exe101.backend.modules.feedback.controller;

import fpt.su26.exe101.backend.modules.feedback.dto.request.FeedbackRequest;
import fpt.su26.exe101.backend.modules.feedback.entity.Feedback;
import fpt.su26.exe101.backend.modules.feedback.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    public ResponseEntity<Feedback> createFeedback(
            @ModelAttribute FeedbackRequest request,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        log.info("POST /api/feedbacks — incoming multipart: userName='{}', category='{}', hasImage={}",
                request.getUserName(), request.getCategory(),
                imageFile != null && !imageFile.isEmpty());
        try {
            Feedback feedback = feedbackService.createFeedback(request, imageFile);
            log.info("POST /api/feedbacks — 200 OK, id={}", feedback.getId());
            return ResponseEntity.ok(feedback);
        } catch (IOException e) {
            log.error("POST /api/feedbacks — 500 I/O error while creating feedback: {}",
                    e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(summary = "Get all feedbacks", description = "Returns a list of all stored user feedbacks")
    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedbacks() {
        log.info("GET /api/feedbacks");
        List<Feedback> all = feedbackService.getAllFeedbacks();
        log.info("GET /api/feedbacks — 200 OK, count={}", all.size());
        return ResponseEntity.ok(all);
    }
}
