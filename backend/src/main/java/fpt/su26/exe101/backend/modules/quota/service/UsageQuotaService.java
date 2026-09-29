package fpt.su26.exe101.backend.modules.quota.service;

import fpt.su26.exe101.backend.modules.quota.entity.UserUsageQuota;
import fpt.su26.exe101.backend.base.enums.UserPlan;
import java.util.UUID;
import java.util.Optional;

/** Shared account quota contract for CV and Interview services. */
public interface UsageQuotaService {
    void initializeDefaultQuota(UUID accountId);
    UserPlan getPlan(UUID accountId);
    Optional<UserUsageQuota> getQuota(UUID accountId);
    void consumeCvCreation(UUID accountId);
    void consumeCvAiAnalysis(UUID accountId);
    void refundCvAiAnalysis(UUID accountId);
    void consumeInterviewMinutes(UUID accountId, int minutes);
    void refundInterviewMinutes(UUID accountId, int minutes);
    void activatePlan(UUID accountId, UserPlan plan, int cvCnt, int aiCvCnt, int intMin);
    void addQuota(UUID accountId, int cvCnt, int aiCvCnt, int intMin);
}
