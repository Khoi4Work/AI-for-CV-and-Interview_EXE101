package fpt.su26.exe101.backend.modules.cv.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.cv.entity.CV;
import fpt.su26.exe101.backend.modules.cv.repository.CVRepository;
import fpt.su26.exe101.backend.modules.cv.service.CVAnalysisQuotaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CVAnalysisQuotaServiceImpl implements CVAnalysisQuotaService {
    private final CVRepository cvRepository;

    @Transactional
    public void consume(UUID accountId, UUID cvId) {
        CV cv = ownedCvForUpdate(accountId, cvId);
        if (cv.getAiAnalysisRemaining() <= 0) {
            log.warn("[QUOTA] Request denied | accountId={} | cvId={} | type=cv_ai_analysis | reason=exhausted",
                    accountId, cvId);
            throw new ApiException(ErrorCode.QUOTA_EXCEEDED, "CV này đã hết lượt phân tích AI.");
        }
        cv.setAiAnalysisRemaining(cv.getAiAnalysisRemaining() - 1);
        log.info("[QUOTA] Consumed | accountId={} | cvId={} | type=cv_ai_analysis | remaining={}/{}",
                accountId, cvId, cv.getAiAnalysisRemaining(), cv.getAiAnalysisLimit());
    }

    @Transactional
    public void refund(UUID accountId, UUID cvId) {
        CV cv = ownedCvForUpdate(accountId, cvId);
        cv.setAiAnalysisRemaining(Math.min(cv.getAiAnalysisLimit(), cv.getAiAnalysisRemaining() + 1));
        log.info("[QUOTA] Refunded | accountId={} | cvId={} | type=cv_ai_analysis | remaining={}/{}",
                accountId, cvId, cv.getAiAnalysisRemaining(), cv.getAiAnalysisLimit());
    }

    private CV ownedCvForUpdate(UUID accountId, UUID cvId) {
        CV cv = cvRepository.findByIdForUpdate(cvId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "CV not found"));
        if (!cv.getGallery().getAccountId().equals(accountId)) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION);
        }
        return cv;
    }
}
