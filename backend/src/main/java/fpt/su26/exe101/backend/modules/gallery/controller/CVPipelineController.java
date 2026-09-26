package fpt.su26.exe101.backend.modules.gallery.controller;

import fpt.su26.exe101.backend.modules.gallery.dto.*;
import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;
import fpt.su26.exe101.backend.modules.gallery.service.CVPipelineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/cv")
@RequiredArgsConstructor
public class CVPipelineController {

    private final CVPipelineService cvPipelineService;

    // --- Import ---
    @PostMapping("/imports")
    public ResponseEntity<CVImportResponse> importCV(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(cvPipelineService.importCV(file.getBytes(), file.getContentType()));
    }

    // --- Lifecycle ---
    @PostMapping
    public ResponseEntity<fpt.su26.exe101.backend.modules.gallery.entity.CV> createCV(
            @RequestBody CVCreateRequest request,
            @RequestAttribute("gallery") Gallery gallery) {
        return ResponseEntity.ok(cvPipelineService.createCV(request, gallery));
    }

    @PutMapping("/{id}")
    public ResponseEntity<fpt.su26.exe101.backend.modules.gallery.entity.CV> updateCV(
            @PathVariable UUID id,
            @RequestBody CVUpdateRequest request,
            @RequestAttribute("gallery") Gallery gallery) {
        return ResponseEntity.ok(cvPipelineService.updateCV(id, request, gallery));
    }

    // --- Optimization ---
    @PostMapping("/{id}/optimizations")
    public ResponseEntity<CVOptimizationJobResponse> optimizeCV(
            @PathVariable UUID id,
            @RequestBody CVOptimizationRequest request,
            @RequestAttribute("gallery") Gallery gallery) {
        return ResponseEntity.ok(cvPipelineService.startOptimization(id, request, gallery));
    }

    @GetMapping("/optimizations/{jobId}")
    public ResponseEntity<CVOptimizationStatusResponse> getOptimizationStatus(@PathVariable String jobId) {
        return ResponseEntity.ok(cvPipelineService.getOptimizationStatus(jobId));
    }

    @GetMapping("/optimizations/{jobId}/result")
    public ResponseEntity<CVOptimizationResultResponse> getOptimizationResult(@PathVariable String jobId) {
        return ResponseEntity.ok(cvPipelineService.getOptimizationResult(jobId));
    }

    // --- Evaluation & Feedback ---
    @GetMapping("/{id}/evaluations")
    public ResponseEntity<CVEvaluationResponse> evaluateCV(
            @PathVariable UUID id,
            @RequestParam UUID jdId,
            @RequestAttribute("gallery") Gallery gallery) {
        return ResponseEntity.ok(cvPipelineService.evaluateCV(id, jdId, gallery));
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<CVFeedbackResponse> requestFeedback(
            @PathVariable UUID id,
            @RequestParam UUID jdId,
            @RequestAttribute("gallery") Gallery gallery) {
        return ResponseEntity.ok(cvPipelineService.requestFeedback(id, jdId, gallery));
    }

    @GetMapping("/{id}/feedback")
    public ResponseEntity<CVFeedbackResponse> getFeedback(
            @PathVariable UUID id,
            @RequestAttribute("gallery") Gallery gallery) {
        return ResponseEntity.ok(cvPipelineService.getFeedback(id, gallery));
    }

    @GetMapping("/{id}/skill-gap")
    public ResponseEntity<CVSkillGapResponse> analyzeSkillGap(
            @PathVariable UUID id,
            @RequestParam UUID jdId,
            @RequestAttribute("gallery") Gallery gallery) {
        return ResponseEntity.ok(cvPipelineService.analyzeSkillGap(id, jdId, gallery));
    }
}
