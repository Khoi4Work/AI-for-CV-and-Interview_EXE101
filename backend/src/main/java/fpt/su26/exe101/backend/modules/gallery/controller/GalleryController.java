package fpt.su26.exe101.backend.modules.gallery.controller;

import fpt.su26.exe101.backend.modules.gallery.dto.*;
import fpt.su26.exe101.backend.modules.gallery.service.GalleryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/gallery")
@RequiredArgsConstructor
public class GalleryController {
    private final GalleryService galleryService;

    @GetMapping("/assets")
    public ResponseEntity<GalleryAssetsResponseDTO> getAssets() {
        return ResponseEntity.ok(galleryService.getGalleryAssets());
    }

    @PostMapping("/jd")
    public ResponseEntity<JDResponseDTO> createJD(@RequestBody JDCreateRequestDTO request) {
        return ResponseEntity.ok(galleryService.createJobDescription(request));
    }

    @PutMapping("/jd/{id}")
    public ResponseEntity<JDResponseDTO> updateJD(@PathVariable UUID id, @RequestBody JDUpdateRequestDTO request) {
        return ResponseEntity.ok(galleryService.updateJobDescription(id, request));
    }

    @DeleteMapping("/jd/{id}")
    public ResponseEntity<Void> deleteJD(@PathVariable UUID id) {
        galleryService.deleteJobDescription(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/cv/{id}")
    public ResponseEntity<Void> deleteCV(@PathVariable UUID id) {
        galleryService.deleteCV(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/interviews")
    public ResponseEntity<List<InterviewSessionResponseDTO>> getInterviewHistory() {
        return ResponseEntity.ok(galleryService.getInterviewHistory());
    }

    @GetMapping("/interviews/{sessionId}/answers")
    public ResponseEntity<List<InterviewAnswerResponseDTO>> getInterviewAnswers(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(galleryService.getInterviewAnswers(sessionId));
    }
}
