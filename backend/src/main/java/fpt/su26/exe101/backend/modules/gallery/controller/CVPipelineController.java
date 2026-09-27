package fpt.su26.exe101.backend.modules.gallery.controller;

import fpt.su26.exe101.backend.base.response.ApiResponse;
import fpt.su26.exe101.backend.modules.gallery.dto.*;
import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;
import fpt.su26.exe101.backend.modules.gallery.service.impl.CVPipelineServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/cv")
@RequiredArgsConstructor
public class CVPipelineController {

    private final CVPipelineServiceImpl cvPipelineServiceImpl;

    // --- Import ---
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<CVImportResponseDTO> importCV(@RequestParam("file") MultipartFile file) throws IOException {
        return ApiResponse
                .success(cvPipelineServiceImpl.importCV(file.getBytes(), file.getContentType()),
                        "IMPORT SUCCESS"
                );
    }

    // --- Lifecycle ---
    @PostMapping
    public ApiResponse<CVResponseDTO> createCV(
            @RequestBody CVCreateRequestDTO request,
            @RequestAttribute("gallery") Gallery gallery) {
        return ApiResponse.success(cvPipelineServiceImpl.createCV(request, gallery));
    }

    @PutMapping("/{id}")
    public ApiResponse<CVResponseDTO> updateCV(
            @PathVariable UUID id,
            @RequestBody CVUpdateRequestDTO request,
            @RequestAttribute("gallery") Gallery gallery) {
        return ApiResponse.success(cvPipelineServiceImpl.updateCV(id, request, gallery));
    }

    // --- Optimization ---
    @PostMapping("/{id}/optimizations")
    public ApiResponse<CVOptimizationJobResponseDTO> optimizeCV(
            @PathVariable UUID id,
            @RequestBody CVOptimizationRequestDTO request,
            @RequestAttribute("gallery") Gallery gallery) {
        return ApiResponse.success(cvPipelineServiceImpl.startOptimization(id, request, gallery));
    }

    @GetMapping("/optimizations/{jobId}")
    public ApiResponse<CVOptimizationStatusResponseDTO> getOptimizationStatus(@PathVariable String jobId) {
        return ApiResponse.success(cvPipelineServiceImpl.getOptimizationStatus(jobId));
    }

    @GetMapping("/optimizations/{jobId}/result")
    public ApiResponse<CVOptimizationResultResponseDTO> getOptimizationResult(@PathVariable String jobId) {
        return ApiResponse.success(cvPipelineServiceImpl.getOptimizationResult(jobId));
    }

    // --- Evaluation & Feedback ---
    @GetMapping("/{id}/evaluations")
    public ApiResponse<CVEvaluationResponseDTO> evaluateCV(
            @PathVariable UUID id,
            @RequestParam UUID jdId,
            @RequestAttribute("gallery") Gallery gallery) {
        return ApiResponse.success(cvPipelineServiceImpl.evaluateCV(id, jdId, gallery));
    }

    @PostMapping("/{id}/feedback")
    public ApiResponse<CVFeedbackResponseDTO> requestFeedback(
            @PathVariable UUID id,
            @RequestParam UUID jdId,
            @RequestAttribute("gallery") Gallery gallery) {
        return ApiResponse.success(cvPipelineServiceImpl.requestFeedback(id, jdId, gallery));
    }

    @GetMapping("/{id}/feedback")
    public ApiResponse<CVFeedbackResponseDTO> getFeedback(
            @PathVariable UUID id,
            @RequestAttribute("gallery") Gallery gallery) {
        return ApiResponse.success(cvPipelineServiceImpl.getFeedback(id, gallery));
    }

    @GetMapping("/{id}/skill-gap")
    public ApiResponse<CVSkillGapResponseDTO> analyzeSkillGap(
            @PathVariable UUID id,
            @RequestParam UUID jdId,
            @RequestAttribute("gallery") Gallery gallery) {
        return ApiResponse.success(cvPipelineServiceImpl.analyzeSkillGap(id, jdId, gallery));
    }
}
