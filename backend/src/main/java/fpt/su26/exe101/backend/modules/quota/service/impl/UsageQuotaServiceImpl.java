package fpt.su26.exe101.backend.modules.quota.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.quota.config.QuotaBenefitConfig;
import fpt.su26.exe101.backend.modules.quota.config.QuotaBenefitConfig.QuotaBenefit;
import fpt.su26.exe101.backend.modules.quota.entity.UserUsageQuota;
import fpt.su26.exe101.backend.modules.quota.repository.UserUsageQuotaRepository;
import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import fpt.su26.exe101.backend.modules.quota.event.QuotaInitializationRequestedEvent;
import org.springframework.context.ApplicationEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UsageQuotaServiceImpl implements UsageQuotaService {
    private final UserUsageQuotaRepository repository;
    private final ApplicationEventPublisher eventPublisher;
    private final QuotaBenefitConfig benefitConfig;

    @Override @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void initializeDefaultQuota(UUID accountId) {
        repository.findByAccountId(accountId).orElseGet(() -> repository.save(defaultQuota(accountId)));
    }

    private UserUsageQuota lockedQuota(UUID accountId) {
        return repository.findByAccountIdForUpdate(accountId).orElseGet(() -> {
            return repository.save(defaultQuota(accountId));
        });
    }

    @Override @Transactional(readOnly = true)
    public UserPlan getPlan(UUID accountId) {
        return repository.findByAccountId(accountId).map(UserUsageQuota::getPlan).orElseGet(() -> {
            eventPublisher.publishEvent(new QuotaInitializationRequestedEvent(accountId));
            return UserPlan.FREE;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Optional<UserUsageQuota> getQuota(UUID accountId) {
        return repository.findByAccountId(accountId);
    }

    private UserUsageQuota defaultQuota(UUID accountId) {
        QuotaBenefit freeBenefit = benefitConfig.getBenefit(UserPlan.FREE);
        return UserUsageQuota.builder().accountId(accountId).plan(UserPlan.FREE)
                .remainingCvCnt(freeBenefit.getCvCnt())
                .remainingCvAiCnt(freeBenefit.getAiCvCnt())
                .remainingIntMin(freeBenefit.getIntMin())
                .build();
    }

    @Override @Transactional
    public void consumeCvCreation(UUID accountId) {
        UserUsageQuota quota = lockedQuota(accountId);
        if (quota.getRemainingCvCnt() <= 0) throw new ApiException(ErrorCode.QUOTA_EXCEEDED);
        quota.setRemainingCvCnt(quota.getRemainingCvCnt() - 1);
    }

    @Override @Transactional
    public void consumeCvAiAnalysis(UUID accountId) {
        UserUsageQuota quota = lockedQuota(accountId);
        if (quota.getRemainingCvAiCnt() <= 0) throw new ApiException(ErrorCode.QUOTA_EXCEEDED);
        quota.setRemainingCvAiCnt(quota.getRemainingCvAiCnt() - 1);
    }

    @Override @Transactional
    public void refundCvAiAnalysis(UUID accountId) {
        UserUsageQuota quota = lockedQuota(accountId);
        quota.setRemainingCvAiCnt(quota.getRemainingCvAiCnt() + 1);
    }

    @Override @Transactional
    public void consumeInterviewMinutes(UUID accountId, int minutes) {
        if (minutes <= 0) throw new IllegalArgumentException("Interview minutes must be positive");
        UserUsageQuota quota = lockedQuota(accountId);
        if (quota.getRemainingIntMin() < minutes) throw new ApiException(ErrorCode.QUOTA_EXCEEDED);
        quota.setRemainingIntMin(quota.getRemainingIntMin() - minutes);
    }

    @Override @Transactional
    public void refundInterviewMinutes(UUID accountId, int minutes) {
        if (minutes <= 0) throw new IllegalArgumentException("Interview minutes must be positive");
        UserUsageQuota quota = lockedQuota(accountId);
        quota.setRemainingIntMin(quota.getRemainingIntMin() + minutes);
    }

    @Override
    @Transactional
    public void activatePlan(UUID accountId, UserPlan plan) {
        if (plan == null) throw new ApiException(ErrorCode.INVALID_INPUT, "Plan is required");
        QuotaBenefit benefit = benefitConfig.getBenefit(plan);
        UserUsageQuota quota = lockedQuota(accountId);
        quota.setPlan(plan);
        quota.setRemainingCvCnt(benefit.getCvCnt());
        quota.setRemainingCvAiCnt(benefit.getAiCvCnt());
        quota.setRemainingIntMin(benefit.getIntMin());
    }

    @Override
    @Transactional
    public void addQuota(UUID accountId, int cvCnt, int aiCvCnt, int intMin) {
        if (cvCnt < 0 || aiCvCnt < 0 || intMin < 0 || (cvCnt == 0 && aiCvCnt == 0 && intMin == 0)) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "At least one non-negative quota amount is required");
        }
        UserUsageQuota quota = lockedQuota(accountId);
        quota.setRemainingCvCnt(quota.getRemainingCvCnt() + cvCnt);
        quota.setRemainingCvAiCnt(quota.getRemainingCvAiCnt() + aiCvCnt);
        quota.setRemainingIntMin(quota.getRemainingIntMin() + intMin);
    }
}
