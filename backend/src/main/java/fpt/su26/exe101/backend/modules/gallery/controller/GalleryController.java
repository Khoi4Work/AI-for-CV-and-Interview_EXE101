package fpt.su26.exe101.backend.modules.gallery.controller;

import fpt.su26.exe101.backend.modules.gallery.dto.request.JDCreateRequestDTO;
import fpt.su26.exe101.backend.modules.gallery.dto.request.JDUpdateRequestDTO;
import fpt.su26.exe101.backend.modules.gallery.dto.response.GalleryAssetsResponseDTO;
import fpt.su26.exe101.backend.modules.gallery.dto.response.JDResponseDTO;
import fpt.su26.exe101.backend.modules.gallery.service.GalleryService;
import fpt.su26.exe101.backend.modules.cv.service.CVPipelineService;
import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewAnswerResponseDTO;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewSessionResponseDTO;
import fpt.su26.exe101.backend.modules.interview.service.InterviewService;
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
    private final InterviewService interviewService;
    private final CVPipelineService cvPipelineService;

    @GetMapping("/assets")
    public ResponseEntity<GalleryAssetsResponseDTO> getAssets() {
        Gallery gallery = galleryService.getCurrentGallery();
        return ResponseEntity.ok(GalleryAssetsResponseDTO.builder()
                .cvs(cvPipelineService.getCVsForGallery(gallery))
                .jds(galleryService.getJobDescriptionsForCurrentGallery())
                .build());
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
        cvPipelineService.deleteCV(id, galleryService.getCurrentGallery());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/interviews")
    public ResponseEntity<List<InterviewSessionResponseDTO>> getInterviewHistory() {
        return ResponseEntity.ok(interviewService.getInterviewHistory());
    }

    @GetMapping("/interviews/{sessionId}/answers")
    public ResponseEntity<List<InterviewAnswerResponseDTO>> getInterviewAnswers(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(interviewService.getInterviewAnswers(sessionId));
    }
}
