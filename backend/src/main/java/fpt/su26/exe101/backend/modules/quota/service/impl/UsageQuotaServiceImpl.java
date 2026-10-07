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
        return repository.findByAccountId(accountId).map(UserUsageQuota::getCvPlan).orElseGet(() -> {
            eventPublisher.publishEvent(new QuotaInitializationRequestedEvent(accountId));
            return UserPlan.FREE;
        });
    }

    @Override @Transactional(readOnly = true)
    public UserPlan getInterviewPlan(UUID accountId) {
        return repository.findByAccountId(accountId).map(UserUsageQuota::getInterviewPlan).orElseGet(() -> {
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
                .remainingCvAiCnt(0)
                .remainingCvFreeCredits(freeBenefit.getCvCnt())
                .remainingIntMin(0)
                .build();
    }

    @Override @Transactional
    public UsageQuotaService.CvCreationQuota consumeCvCreation(UUID accountId) {
        UserUsageQuota quota = lockedQuota(accountId);
        UserPlan consumedPlan;
        if (quota.getRemainingCvFreeCredits() > 0) {
            quota.setRemainingCvFreeCredits(quota.getRemainingCvFreeCredits() - 1);
            consumedPlan = UserPlan.FREE;
        } else if (quota.getRemainingCvMiddleCredits() > 0) {
            quota.setRemainingCvMiddleCredits(quota.getRemainingCvMiddleCredits() - 1);
            consumedPlan = UserPlan.MIDDLE;
        } else if (quota.getRemainingCvEnhanceCredits() > 0) {
            quota.setRemainingCvEnhanceCredits(quota.getRemainingCvEnhanceCredits() - 1);
            consumedPlan = UserPlan.ENHANCE;
        } else {
            log.warn("[QUOTA] Request denied | accountId={} | type=cv_creation | reason=exhausted", accountId);
            throw new ApiException(ErrorCode.QUOTA_EXCEEDED);
        }
        quota.setRemainingCvCnt(quota.getRemainingCvFreeCredits() + quota.getRemainingCvMiddleCredits()
                + quota.getRemainingCvEnhanceCredits());
        int analysisLimit = benefitConfig.getBenefit(consumedPlan).getAiCvCnt();
        int legacyAnalysis = Math.min(Math.max(0, quota.getRemainingCvAiCnt()), analysisLimit);
        if (legacyAnalysis > 0) quota.setRemainingCvAiCnt(quota.getRemainingCvAiCnt() - legacyAnalysis);
        int analysisRemaining = legacyAnalysis > 0 ? legacyAnalysis : analysisLimit;
        return new UsageQuotaService.CvCreationQuota(consumedPlan, analysisLimit, analysisRemaining);
    }

    @Override
    @Transactional(readOnly = true)
    public void requireCvCreationCredit(UUID accountId) {
        UserUsageQuota quota = repository.findByAccountId(accountId).orElse(null);
        int available = quota == null ? benefitConfig.getBenefit(UserPlan.FREE).getCvCnt()
                : quota.getRemainingCvFreeCredits() + quota.getRemainingCvMiddleCredits()
                    + quota.getRemainingCvEnhanceCredits();
        if (available <= 0) {
            throw new ApiException(ErrorCode.QUOTA_EXCEEDED);
        }
    }

    @Override @Transactional
    public void consumeInterviewMinutes(UUID accountId, int minutes) {
        if (minutes <= 0) throw new IllegalArgumentException("Interview minutes must be positive");
        UserUsageQuota quota = lockedQuota(accountId);
        if (quota.getRemainingIntMin() < minutes) {
            log.warn("[QUOTA] Request denied | accountId={} | type=interview_minutes | requested={} | reason=insufficient",
                    accountId, minutes);
            throw new ApiException(ErrorCode.QUOTA_EXCEEDED);
        }
        quota.setRemainingIntMin(quota.getRemainingIntMin() - minutes);
    }

    @Override @Transactional
    public void refundInterviewMinutes(UUID accountId, int minutes) {
        if (minutes <= 0) throw new IllegalArgumentException("Interview minutes must be positive");
        UserUsageQuota quota = lockedQuota(accountId);
        quota.setRemainingIntMin(quota.getRemainingIntMin() + minutes);
        log.info("[QUOTA] Refunded | accountId={} | type=interview_minutes | minutes={}", accountId, minutes);
    }

    @Override
    @Transactional
    public void grantCvPackage(UUID accountId, UserPlan plan, int cvCount) {
        if (plan == null || cvCount < 0) throw new ApiException(ErrorCode.INVALID_INPUT, "Valid CV plan and quota are required");
        UserUsageQuota quota = lockedQuota(accountId);
        UserPlan effectivePlan = quota.getCvPlan() == null || quota.getCvPlan().ordinal() < plan.ordinal()
                ? plan : quota.getCvPlan();
        quota.setCvPlan(effectivePlan);
        quota.setCvPeriodStart(null);
        quota.setCvPeriodEnd(null);
        quota.setCvExpiryEmailSent(false);
        switch (plan) {
            case FREE -> quota.setRemainingCvFreeCredits(quota.getRemainingCvFreeCredits() + cvCount);
            case MIDDLE -> quota.setRemainingCvMiddleCredits(quota.getRemainingCvMiddleCredits() + cvCount);
            case ENHANCE -> quota.setRemainingCvEnhanceCredits(quota.getRemainingCvEnhanceCredits() + cvCount);
        }
        quota.setRemainingCvCnt(quota.getRemainingCvFreeCredits() + quota.getRemainingCvMiddleCredits()
                + quota.getRemainingCvEnhanceCredits());
        // Kept as a legacy aggregate field for old clients; new CV usage is tracked per CV.
        quota.setRemainingCvAiCnt(0);
        log.info("[QUOTA] CV package granted | accountId={} | plan={} | cvCredits={} | effectivePlan={}",
                accountId, plan, cvCount, effectivePlan);
    }

    @Override
    @Transactional
    public void grantInterviewPackage(UUID accountId, UserPlan plan, int interviewMinutes) {
        if (plan == null || interviewMinutes < 0) throw new ApiException(ErrorCode.INVALID_INPUT, "Valid Interview plan and quota are required");
        UserUsageQuota quota = lockedQuota(accountId);
        UserPlan effectivePlan = quota.getInterviewPlan() == null || quota.getInterviewPlan().ordinal() < plan.ordinal()
                ? plan : quota.getInterviewPlan();
        quota.setInterviewPlan(effectivePlan);
        quota.setInterviewPeriodStart(null);
        quota.setInterviewPeriodEnd(null);
        quota.setInterviewExpiryEmailSent(false);
        quota.setRemainingIntMin(quota.getRemainingIntMin() + interviewMinutes);
        log.info("[QUOTA] Interview package granted | accountId={} | plan={} | minutes={} | effectivePlan={} | remainingMinutes={}",
                accountId, plan, interviewMinutes, effectivePlan, quota.getRemainingIntMin());
    }
}
