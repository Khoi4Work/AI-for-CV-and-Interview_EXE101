package fpt.su26.exe101.backend.modules.quota.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
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
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
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
    public UserPlan getCvPlan(UUID accountId) {
        return repository.findByAccountId(accountId).map(quota -> isExpired(quota.getCvPeriodEnd())
                ? UserPlan.FREE : quota.getCvPlan()).orElseGet(() -> {
            eventPublisher.publishEvent(new QuotaInitializationRequestedEvent(accountId));
            return UserPlan.FREE;
        });
    }

    @Override @Transactional(readOnly = true)
    public UserPlan getInterviewPlan(UUID accountId) {
        return repository.findByAccountId(accountId).map(quota -> isExpired(quota.getInterviewPeriodEnd())
                ? UserPlan.FREE : quota.getInterviewPlan()).orElseGet(() -> {
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
        return UserUsageQuota.builder().accountId(accountId).cvPlan(UserPlan.FREE).interviewPlan(UserPlan.FREE)
                .remainingCvCnt(freeBenefit.getCvCnt())
                .remainingCvAiCnt(freeBenefit.getAiCvCnt())
                .remainingIntMin(0)
                .build();
    }

    @Override @Transactional
    public void consumeCvCreation(UUID accountId) {
        UserUsageQuota quota = lockedQuota(accountId);
        expireCvIfNeeded(quota);
        if (quota.getRemainingCvCnt() <= 0) {
            log.warn("[QUOTA] Request denied | accountId={} | type=cv_creation | reason=exhausted", accountId);
            throw new ApiException(ErrorCode.QUOTA_EXCEEDED);
        }
        quota.setRemainingCvCnt(quota.getRemainingCvCnt() - 1);
    }

    @Override @Transactional
    public void consumeCvAiAnalysis(UUID accountId) {
        UserUsageQuota quota = lockedQuota(accountId);
        expireCvIfNeeded(quota);
        if (quota.getRemainingCvAiCnt() <= 0) {
            log.warn("[QUOTA] Request denied | accountId={} | type=cv_ai_analysis | reason=exhausted", accountId);
            throw new ApiException(ErrorCode.QUOTA_EXCEEDED);
        }
        quota.setRemainingCvAiCnt(quota.getRemainingCvAiCnt() - 1);
    }

    @Override @Transactional
    public void refundCvAiAnalysis(UUID accountId) {
        UserUsageQuota quota = lockedQuota(accountId);
        quota.setRemainingCvAiCnt(quota.getRemainingCvAiCnt() + 1);
        log.info("[QUOTA] Refunded | accountId={} | type=cv_ai_analysis", accountId);
    }

    @Override @Transactional
    public void consumeInterviewMinutes(UUID accountId, int minutes) {
        if (minutes <= 0) throw new IllegalArgumentException("Interview minutes must be positive");
        UserUsageQuota quota = lockedQuota(accountId);
        expireInterviewIfNeeded(quota);
        if (quota.getRemainingIntMin() < minutes) {
            log.warn("[QUOTA] Request denied | accountId={} | type=interview_minutes | requested={} | reason=insufficient",
                    accountId, minutes);
            throw new ApiException(ErrorCode.QUOTA_EXCEEDED);
        }
        quota.setRemainingIntMin(quota.getRemainingIntMin() - minutes);
    }

    @Override @Transactional
    public void refundInterviewMinutes(UUID accountId, int minutes, LocalDateTime periodStart) {
        if (minutes <= 0) throw new IllegalArgumentException("Interview minutes must be positive");
        UserUsageQuota quota = lockedQuota(accountId);
        if (periodStart == null || !periodStart.equals(quota.getInterviewPeriodStart())
                || quota.getInterviewPlan() == UserPlan.FREE || isExpired(quota.getInterviewPeriodEnd())) return;
        quota.setRemainingIntMin(quota.getRemainingIntMin() + minutes);
        log.info("[QUOTA] Refunded | accountId={} | type=interview_minutes | minutes={}", accountId, minutes);
    }

    @Override
    @Transactional
    public void activateCvSubscription(UUID accountId, UserPlan plan, int cvCount) {
        if (plan == null || cvCount < 0) throw new ApiException(ErrorCode.INVALID_INPUT, "Valid CV plan and quota are required");
        QuotaBenefit benefit = benefitConfig.getBenefit(plan);
        UserUsageQuota quota = lockedQuota(accountId);
        LocalDateTime now = LocalDateTime.now();
        quota.setCvPlan(plan);
        quota.setCvPeriodStart(now);
        quota.setCvPeriodEnd(now.plusMonths(1));
        quota.setCvExpiryEmailSent(false);
        quota.setRemainingCvCnt(cvCount);
        quota.setRemainingCvAiCnt(benefit.getAiCvCnt());
    }

    @Override
    @Transactional
    public void activateInterviewSubscription(UUID accountId, UserPlan plan, int interviewMinutes) {
        if (plan == null || interviewMinutes < 0) throw new ApiException(ErrorCode.INVALID_INPUT, "Valid Interview plan and quota are required");
        UserUsageQuota quota = lockedQuota(accountId);
        LocalDateTime now = LocalDateTime.now();
        quota.setInterviewPlan(plan);
        quota.setInterviewPeriodStart(now);
        quota.setInterviewPeriodEnd(now.plusMonths(1));
        quota.setInterviewExpiryEmailSent(false);
        quota.setRemainingIntMin(interviewMinutes);
    }

    @Override
    @Transactional
    public void refreshSubscriptionState(UUID accountId) {
        UserUsageQuota quota = lockedQuota(accountId);
        expireCvIfNeeded(quota);
        expireInterviewIfNeeded(quota);
    }

    private boolean isExpired(LocalDateTime periodEnd) {
        return periodEnd != null && !periodEnd.isAfter(LocalDateTime.now());
    }

    private void expireCvIfNeeded(UserUsageQuota quota) {
        if (quota.getCvPlan() != UserPlan.FREE && isExpired(quota.getCvPeriodEnd())) {
            QuotaBenefit free = benefitConfig.getBenefit(UserPlan.FREE);
            quota.setCvPlan(UserPlan.FREE);
            quota.setRemainingCvCnt(free.getCvCnt());
            quota.setRemainingCvAiCnt(free.getAiCvCnt());
        }
    }

    private void expireInterviewIfNeeded(UserUsageQuota quota) {
        if (quota.getInterviewPlan() != UserPlan.FREE && isExpired(quota.getInterviewPeriodEnd())) {
            quota.setInterviewPlan(UserPlan.FREE);
            quota.setRemainingIntMin(0);
        }
    }
}
