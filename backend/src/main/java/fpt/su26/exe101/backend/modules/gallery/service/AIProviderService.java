package fpt.su26.exe101.backend.modules.gallery.service;

import fpt.su26.exe101.backend.modules.gallery.dto.*;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

public interface AIProviderService {
    Map<String, Object> parseCVFile(byte[] fileContent, String contentType);
    CompletableFuture<CVOptimizationResultResponse> optimizeCV(Map<String, Object> cvContent, String jdText);
    CVEvaluationResponse evaluateCV(Map<String, Object> cvContent, String jdText);
    CVFeedbackResponse generateFeedback(Map<String, Object> cvContent, String jdText);
    CVSkillGapResponse analyzeSkillGap(Map<String, Object> cvContent, String jdText);
}
