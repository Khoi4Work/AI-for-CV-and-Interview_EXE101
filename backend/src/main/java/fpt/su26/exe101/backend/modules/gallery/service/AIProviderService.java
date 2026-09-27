package fpt.su26.exe101.backend.modules.gallery.service;

import fpt.su26.exe101.backend.modules.gallery.dto.*;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

public interface AIProviderService {
    Map<String, Object> parseCVFile(byte[] fileContent, String contentType);
    CompletableFuture<CVOptimizationResultResponseDTO> optimizeCV(Map<String, Object> cvContent, String jdText);
    CVEvaluationResponseDTO evaluateCV(Map<String, Object> cvContent, String jdText);
    CVFeedbackResponseDTO generateFeedback(Map<String, Object> cvContent, String jdText);
    CVSkillGapResponseDTO analyzeSkillGap(Map<String, Object> cvContent, String jdText);
}
