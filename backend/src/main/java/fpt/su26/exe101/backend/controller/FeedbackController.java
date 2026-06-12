package fpt.su26.exe101.backend.controller;

import fpt.su26.exe101.backend.dto.FeedbackRequest;
import fpt.su26.exe101.backend.entity.Feedback;
import fpt.su26.exe101.backend.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
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
@Tag(name = "Feedback API", description = "API for managing user feedbacks and images")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @Operation(summary = "Upload feedback with image", description = "Uploads a user's feedback along with an optional image to Cloudinary and saves it to DB")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Feedback> createFeedback(
            @ModelAttribute FeedbackRequest request,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {
        try {
            Feedback feedback = feedbackService.createFeedback(request, imageFile);
            return ResponseEntity.ok(feedback);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(summary = "Get all feedbacks", description = "Returns a list of all stored user feedbacks")
    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks());
    }
}
