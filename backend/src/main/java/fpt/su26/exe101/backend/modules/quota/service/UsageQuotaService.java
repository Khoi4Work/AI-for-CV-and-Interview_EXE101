package fpt.su26.exe101.backend.modules.quota.service;

import fpt.su26.exe101.backend.base.enums.UserPlan;
import java.util.UUID;

/** Shared account quota contract for CV and Interview services. */
public interface UsageQuotaService {
    void initializeDefaultQuota(UUID accountId);
    UserPlan getPlan(UUID accountId);
    void consumeCvCreation(UUID accountId);
    void consumeCvAiAnalysis(UUID accountId);
    void refundCvAiAnalysis(UUID accountId);
    void consumeInterviewMinutes(UUID accountId, int minutes);
    void refundInterviewMinutes(UUID accountId, int minutes);
}
