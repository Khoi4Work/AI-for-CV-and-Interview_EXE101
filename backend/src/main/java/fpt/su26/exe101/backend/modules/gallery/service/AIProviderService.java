package fpt.su26.exe101.backend.modules.gallery.service;

import fpt.su26.exe101.backend.modules.gallery.dto.*;
import java.util.concurrent.CompletableFuture;

public interface AIProviderService {
    CVImportModelResponseDTO parseCVFile(byte[] fileContent, String contentType);
    CompletableFuture<CVOptimizationResultResponseDTO> optimizeCV(CVContent cvContent, String jdText);
    CVEvaluationResponseDTO evaluateCV(CVContent cvContent, String jdText);
    CVFeedbackResponseDTO generateFeedback(CVContent cvContent, String jdText);
    CVSkillGapResponseDTO analyzeSkillGap(CVContent cvContent, String jdText);
}
