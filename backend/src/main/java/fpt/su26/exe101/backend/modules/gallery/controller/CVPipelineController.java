package fpt.su26.exe101.backend.modules.gallery.controller;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.base.response.ApiResponse;
import fpt.su26.exe101.backend.modules.gallery.dto.*;
import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;
import fpt.su26.exe101.backend.modules.gallery.service.impl.CVPipelineServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/cv")
@RequiredArgsConstructor
public class CVPipelineController {

    private static final long MAX_CV_FILE_SIZE = 5L * 1024 * 1024;
    private final CVPipelineServiceImpl cvPipelineServiceImpl;

    // --- Import ---
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<CVImportResponseDTO> importCV(@RequestParam("file") MultipartFile file,
            @RequestAttribute("gallery") Gallery gallery) throws IOException {
        if (file.isEmpty()) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "CV file must not be empty.");
        }
        if (file.getSize() > MAX_CV_FILE_SIZE) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "CV file must not exceed 5 MB.");
        }

        String filename = file.getOriginalFilename();
        int extensionStart = filename == null ? -1 : filename.lastIndexOf('.') + 1;
        String extension = extensionStart <= 0 ? "" : filename.substring(extensionStart).toLowerCase(Locale.ROOT);
        if (!Set.of("pdf", "doc", "docx").contains(extension)) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Only PDF, DOC, and DOCX CV files are supported.");
        }

        return ApiResponse
                .success(cvPipelineServiceImpl.importCV(file.getBytes(), file.getContentType(), file.getOriginalFilename(), gallery),
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
            @RequestParam(required = false) UUID jdId,
            @RequestParam(required = false) String jdText,
            @RequestAttribute("gallery") Gallery gallery) {
        if (jdId != null) return ApiResponse.success(cvPipelineServiceImpl.evaluateCV(id, jdId, gallery));
        if (jdText != null && !jdText.isBlank()) return ApiResponse.success(cvPipelineServiceImpl.evaluateCV(id, jdText, gallery));
        throw new ApiException(ErrorCode.INVALID_INPUT, "jdId or jdText is required.");
    }

    @PostMapping("/{id}/feedback")
    public ApiResponse<CVFeedbackResponseDTO> requestFeedback(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID jdId,
            @RequestBody(required = false) CVFeedbackRequestDTO request,
            @RequestAttribute("gallery") Gallery gallery) {
        UUID resolvedJdId = jdId != null ? jdId : request == null ? null : request.getJdId();
        if (resolvedJdId == null && request != null && request.getJdText() != null) {
            CVEvaluationResponseDTO evaluation = cvPipelineServiceImpl.evaluateCV(id, request.getJdText(), gallery);
            resolvedJdId = evaluation.getJdId();
        }
        if (resolvedJdId == null) throw new ApiException(ErrorCode.INVALID_INPUT, "jdId or jdText is required.");
        return ApiResponse.success(cvPipelineServiceImpl.requestFeedback(id, resolvedJdId, gallery));
    }

    @GetMapping("/{id}/feedback")
    public ApiResponse<CVFeedbackResponseDTO> getFeedback(
            @PathVariable UUID id,
            @RequestParam UUID jdId,
            @RequestAttribute("gallery") Gallery gallery) {
        return ApiResponse.success(cvPipelineServiceImpl.getFeedback(id, jdId, gallery));
    }

    @GetMapping("/{id}/skill-gap")
    public ApiResponse<CVSkillGapResponseDTO> analyzeSkillGap(
            @PathVariable UUID id,
            @RequestParam UUID jdId,
            @RequestAttribute("gallery") Gallery gallery) {
        return ApiResponse.success(cvPipelineServiceImpl.analyzeSkillGap(id, jdId, gallery));
    }
}
