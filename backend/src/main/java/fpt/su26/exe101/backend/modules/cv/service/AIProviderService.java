package fpt.su26.exe101.backend.modules.cv.service;

import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.dto.response.*;

import java.util.concurrent.CompletableFuture;
import fpt.su26.exe101.backend.base.enums.UserPlan;

public interface AIProviderService {
    CVImportModelResponseDTO parseCVFile(byte[] fileContent, String contentType);
    CompletableFuture<CVOptimizationResultResponseDTO> optimizeCV(CVContent cvContent, String jdText);
    CVEvaluationResponseDTO evaluateCV(CVContent cvContent, String jdText, UserPlan plan);
    CVFeedbackResponseDTO generateFeedback(CVContent cvContent, String jdText);
    CVSkillGapResponseDTO analyzeSkillGap(CVContent cvContent, String jdText);
}
