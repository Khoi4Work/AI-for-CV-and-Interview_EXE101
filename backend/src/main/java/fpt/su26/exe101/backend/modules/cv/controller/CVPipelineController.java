package fpt.su26.exe101.backend.modules.cv.controller;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.base.response.ApiResponse;
import fpt.su26.exe101.backend.modules.cv.dto.request.CVCreateRequestDTO;
import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.dto.request.CVFeedbackRequestDTO;
import fpt.su26.exe101.backend.modules.cv.dto.request.CVOptimizationRequestDTO;
import fpt.su26.exe101.backend.modules.cv.dto.request.CVUpdateRequestDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.*;
import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;
import fpt.su26.exe101.backend.modules.gallery.service.GalleryService;
import fpt.su26.exe101.backend.modules.cv.service.CVPipelineService;
import fpt.su26.exe101.backend.modules.cv.service.JDRecommendationService;
import fpt.su26.exe101.backend.modules.cv.service.CVAnalysisService;
import fpt.su26.exe101.backend.modules.cv.dto.request.CVAnalysisStartRequestDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVAnalysisAlternativesResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVAnalysisResponseDTO;
import fpt.su26.exe101.backend.modules.cv.entity.enums.AnalysisStatus;
import fpt.su26.exe101.backend.modules.cv.entity.CV;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/cv")
@RequiredArgsConstructor
public class CVPipelineController {

    private static final long MAX_CV_FILE_SIZE = 5L * 1024 * 1024;
    private final CVPipelineService cvPipelineService;
    private final GalleryService galleryService;
    private final JDRecommendationService jdRecommendationService;
    private final CVAnalysisService analysisService;

    // --- Import ---
    @PostMapping(value = "/extract", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CVContent>> extractCV(@RequestParam("file") MultipartFile file) throws IOException {
        validateCVUpload(file);
        return ResponseEntity.ok(ApiResponse.success(
                cvPipelineService.extractCV(file.getBytes(), file.getContentType(), currentGallery()), "CV EXTRACTED"));
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CVImportResponseDTO>> importCV(@RequestParam("file") MultipartFile file) throws IOException {
        validateCVUpload(file);

        String filename = file.getOriginalFilename();
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                cvPipelineService.importCV(file.getBytes(), file.getContentType(), filename, currentGallery()),
                "IMPORT SUCCESS"));
    }

    @GetMapping("/{id}/jd-recommendations")
    public ResponseEntity<ApiResponse<List<JDRecommendationResponseDTO>>> recommendJDs(
            @PathVariable UUID id) {
        Gallery gallery = currentGallery();
        return ResponseEntity.ok(ApiResponse.success(jdRecommendationService.recommend(id, gallery.getId())));
    }

    @GetMapping("/{id}/jd-alternative-recommendations")
    public ResponseEntity<ApiResponse<List<JDRecommendationResponseDTO>>> recommendHigherScoringOtherRoles(
            @PathVariable UUID id,
            @RequestParam UUID jdId,
            @RequestParam int currentScore) {
        throw migrationRequired();
    }

    private void validateCVUpload(MultipartFile file) {
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
    }

    // --- Lifecycle ---
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CVResponseDTO>> getCV(@PathVariable UUID id) {
        CV cv = cvPipelineService.getCVForInterview(id, currentGallery());
        return ResponseEntity.ok(ApiResponse.success(CVResponseDTO.builder().id(cv.getId()).name(cv.getName())
            .content(cv.getContent()).aiAnalysisLimit(cv.getAiAnalysisLimit()).aiAnalysisRemaining(cv.getAiAnalysisRemaining()).build()));
    }
    @PostMapping
    public ResponseEntity<ApiResponse<CVResponseDTO>> createCV(
            @RequestBody CVCreateRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(cvPipelineService.createCV(request, currentGallery())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CVResponseDTO>> updateCV(
            @PathVariable UUID id,
            @RequestBody CVUpdateRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.success(cvPipelineService.updateCV(id, request, currentGallery())));
    }

    // --- Optimization ---
    @PostMapping("/{id}/optimizations")
    public ResponseEntity<ApiResponse<CVOptimizationJobResponseDTO>> optimizeCV(
            @PathVariable UUID id,
            @RequestBody CVOptimizationRequestDTO request) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.success(cvPipelineService.startOptimization(id, request, currentGallery())));
    }

    @GetMapping("/optimizations/{jobId}")
    public ResponseEntity<ApiResponse<CVOptimizationStatusResponseDTO>> getOptimizationStatus(@PathVariable String jobId) {
        return ResponseEntity.ok(ApiResponse.success(cvPipelineService.getOptimizationStatus(jobId)));
    }

    @GetMapping("/optimizations/{jobId}/result")
    public ResponseEntity<ApiResponse<CVOptimizationResultResponseDTO>> getOptimizationResult(@PathVariable String jobId) {
        return ResponseEntity.ok(ApiResponse.success(cvPipelineService.getOptimizationResult(jobId)));
    }

    // --- Evaluation & Feedback ---
    @PostMapping("/{id}/analysis")
    public ResponseEntity<ApiResponse<CVAnalysisResponseDTO>> analyzeCV(
            @PathVariable UUID id,
            @RequestHeader("Idempotency-Key") String key,
            @RequestBody CVAnalysisStartRequestDTO request) {
        CVAnalysisResponseDTO result = analysisService.start(id, request, key, currentGallery());
        HttpStatus status = result.status() == AnalysisStatus.PENDING || result.status() == AnalysisStatus.PROCESSING
            ? HttpStatus.ACCEPTED : HttpStatus.OK;
        return ResponseEntity.status(status).body(ApiResponse.success(result));
    }

    @GetMapping({"/analyses/{analysisId}", "/analyses/{analysisId}/evidence"})
    public ResponseEntity<ApiResponse<CVAnalysisResponseDTO>> getAnalysis(@PathVariable UUID analysisId) {
        return ResponseEntity.ok(ApiResponse.success(analysisService.read(analysisId, currentGallery())));
    }
    @PostMapping("/analyses/{analysisId}/alternatives")
    public ResponseEntity<ApiResponse<CVAnalysisAlternativesResponseDTO>> startAlternatives(@PathVariable UUID analysisId) {
        return ResponseEntity.ok(ApiResponse.success(analysisService.startAlternatives(analysisId, currentGallery())));
    }
    @GetMapping("/analyses/{analysisId}/alternatives")
    public ResponseEntity<ApiResponse<CVAnalysisAlternativesResponseDTO>> readAlternatives(@PathVariable UUID analysisId) {
        return ResponseEntity.ok(ApiResponse.success(analysisService.readAlternatives(analysisId, currentGallery())));
    }
    private ApiException migrationRequired() {
        return new ApiException(ErrorCode.INVALID_REQUEST, "Dùng POST /api/cv/{id}/analysis và đọc bằng analysisId. Endpoint cũ không tạo đánh giá.");
    }

    @GetMapping("/{id}/evaluations")
    public ResponseEntity<ApiResponse<CVEvaluationResponseDTO>> evaluateCV(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID jdId,
            @RequestParam(required = false) String jdText) {
        throw migrationRequired();
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<ApiResponse<CVFeedbackResponseDTO>> requestFeedback(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID jdId,
            @RequestBody(required = false) CVFeedbackRequestDTO request) {
        throw migrationRequired();
    }

    @GetMapping("/{id}/feedback")
    public ResponseEntity<ApiResponse<CVFeedbackResponseDTO>> getFeedback(
            @PathVariable UUID id,
            @RequestParam UUID jdId) {
        return ResponseEntity.ok(ApiResponse.success(cvPipelineService.getFeedback(id, jdId, currentGallery())));
    }

    @GetMapping("/{id}/skill-gap")
    public ResponseEntity<ApiResponse<CVSkillGapResponseDTO>> analyzeSkillGap(
            @PathVariable UUID id,
            @RequestParam UUID jdId) {
        throw migrationRequired();
    }

    private Gallery currentGallery() {
        return galleryService.getCurrentGallery();
    }
}
