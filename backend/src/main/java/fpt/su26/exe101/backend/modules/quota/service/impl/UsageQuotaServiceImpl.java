package fpt.su26.exe101.backend.modules.quota.service.impl;

import fpt.su26.exe101.backend.modules.quota.config.QuotaBenefitConfig;
import fpt.su26.exe101.backend.modules.quota.config.QuotaBenefitConfig.QuotaBenefit;
import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.quota.entity.UserUsageQuota;
import fpt.su26.exe101.backend.modules.quota.repository.UserUsageQuotaRepository;
import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UsageQuotaServiceImpl implements UsageQuotaService {
    private final UserUsageQuotaRepository repository;
    private final QuotaBenefitConfig quotaBenefitConfig;

    @Override @Transactional
    public void initializeDefaultQuota(UUID accountId) {
        repository.findByAccountId(accountId).orElseGet(() -> {
            QuotaBenefit benefit = quotaBenefitConfig.getBenefit(UserPlan.FREE);
            return repository.save(UserUsageQuota.builder()
                    .accountId(accountId).plan(UserPlan.FREE)
                    .remainingCvCnt(benefit.getCvCnt())
                    .remainingCvAiCnt(benefit.getAiCvCnt())
                    .remainingIntMin(benefit.getIntMin())
                    .build());
        });
    }

    private UserUsageQuota lockedQuota(UUID accountId) {
        return repository.findByAccountIdForUpdate(accountId).orElseGet(() -> {
            QuotaBenefit benefit = quotaBenefitConfig.getBenefit(UserPlan.FREE);
            UserUsageQuota created = UserUsageQuota.builder().accountId(accountId).plan(UserPlan.FREE)
                    .remainingCvCnt(benefit.getCvCnt())
                    .remainingCvAiCnt(benefit.getAiCvCnt())
                    .remainingIntMin(benefit.getIntMin())
                    .build();
            return repository.save(created);
        });
    }

    @Override @Transactional(readOnly = true)
    public UserPlan getPlan(UUID accountId) {
        return repository.findByAccountId(accountId).map(UserUsageQuota::getPlan).orElse(UserPlan.FREE);
    }

    @Override @Transactional(readOnly = true)
    public Optional<UserUsageQuota> getQuota(UUID accountId) {
        Optional<UserUsageQuota> quotaOpt = repository.findByAccountId(accountId);
        if (quotaOpt.isPresent()) {
            UserUsageQuota quota = quotaOpt.get();
            if (quota.getPlan() == null) {
                // Lazy Migration: Handle users with null plan
                quota.setPlan(UserPlan.FREE);
                QuotaBenefit benefit = quotaBenefitConfig.getBenefit(UserPlan.FREE);
                quota.setRemainingCvCnt(benefit.getCvCnt());
                quota.setRemainingCvAiCnt(benefit.getAiCvCnt());
                quota.setRemainingIntMin(benefit.getIntMin());
                repository.save(quota);
                return Optional.of(quota);
            }
        }
        return quotaOpt;
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

    @Override @Transactional
    public void activatePlan(UUID accountId, UserPlan plan, int cvCnt, int aiCvCnt, int intMin) {
        UserUsageQuota quota = lockedQuota(accountId);
        QuotaBenefit benefit = quotaBenefitConfig.getBenefit(plan);

        quota.setPlan(plan);
        quota.setRemainingCvCnt(benefit.getCvCnt());
        quota.setRemainingCvAiCnt(benefit.getAiCvCnt());
        quota.setRemainingIntMin(benefit.getIntMin());
        repository.save(quota);
    }

    @Override @Transactional
    public void addQuota(UUID accountId, int cvCnt, int aiCvCnt, int intMin) {
        UserUsageQuota quota = lockedQuota(accountId);
        quota.setRemainingCvCnt(quota.getRemainingCvCnt() + cvCnt);
        quota.setRemainingCvAiCnt(quota.getRemainingCvAiCnt() + aiCvCnt);
        quota.setRemainingIntMin(quota.getRemainingIntMin() + intMin);
        repository.save(quota);
    }
}
