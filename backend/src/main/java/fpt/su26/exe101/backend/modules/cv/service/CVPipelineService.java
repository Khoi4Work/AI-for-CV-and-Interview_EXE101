package fpt.su26.exe101.backend.modules.cv.service;

import fpt.su26.exe101.backend.modules.cv.dto.request.CVCreateRequestDTO;
import fpt.su26.exe101.backend.modules.cv.dto.request.CVOptimizationRequestDTO;
import fpt.su26.exe101.backend.modules.cv.dto.request.CVUpdateRequestDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.*;
import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.entity.CV;
import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;

import java.util.List;
import java.util.UUID;

public interface CVPipelineService {
    List<CVResponseDTO> getCVsForGallery(Gallery gallery);
    CV getCVForInterview(UUID cvId, Gallery gallery);
    void deleteCV(UUID id, Gallery gallery);
    CVResponseDTO createCV(CVCreateRequestDTO request, Gallery gallery);
    CVResponseDTO updateCV(UUID id, CVUpdateRequestDTO request, Gallery gallery);
    CVImportResponseDTO importCV(byte[] fileContent, String contentType, String filename, Gallery gallery);
    CVContent extractCV(byte[] fileContent, String contentType, Gallery gallery);
    CVOptimizationJobResponseDTO startOptimization(UUID cvId, CVOptimizationRequestDTO request, Gallery gallery);
    CVOptimizationStatusResponseDTO getOptimizationStatus(String jobId);
    CVOptimizationResultResponseDTO getOptimizationResult(String jobId);
    CVEvaluationResponseDTO evaluateCV(UUID cvId, UUID jdId, Gallery gallery);
    CVEvaluationResponseDTO evaluateCV(UUID cvId, String jdText, Gallery gallery);
    CVEvaluationBundleResponseDTO analyzeCV(UUID cvId, String jdText, Gallery gallery);
    CVFeedbackResponseDTO requestFeedback(UUID cvId, UUID jdId, Gallery gallery);
    CVFeedbackResponseDTO getFeedback(UUID cvId, UUID jdId, Gallery gallery);
    CVSkillGapResponseDTO analyzeSkillGap(UUID cvId, UUID jdId, Gallery gallery);

}
