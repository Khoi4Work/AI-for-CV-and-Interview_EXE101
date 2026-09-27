package fpt.su26.exe101.backend.modules.gallery.service;

import fpt.su26.exe101.backend.modules.gallery.dto.*;
import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;

import java.util.UUID;

public interface CVPipelineService {
    CVResponseDTO createCV(CVCreateRequestDTO request, Gallery gallery);
    CVResponseDTO updateCV(UUID id, CVUpdateRequestDTO request, Gallery gallery);
    CVImportResponseDTO importCV(byte[] fileContent, String contentType);
    CVOptimizationJobResponseDTO startOptimization(UUID cvId, CVOptimizationRequestDTO request, Gallery gallery);
    CVOptimizationStatusResponseDTO getOptimizationStatus(String jobId);
    CVOptimizationResultResponseDTO getOptimizationResult(String jobId);
    CVEvaluationResponseDTO evaluateCV(UUID cvId, UUID jdId, Gallery gallery);
    CVFeedbackResponseDTO requestFeedback(UUID cvId, UUID jdId, Gallery gallery);
    CVFeedbackResponseDTO getFeedback(UUID cvId, Gallery gallery);
    CVSkillGapResponseDTO analyzeSkillGap(UUID cvId, UUID jdId, Gallery gallery);

}
