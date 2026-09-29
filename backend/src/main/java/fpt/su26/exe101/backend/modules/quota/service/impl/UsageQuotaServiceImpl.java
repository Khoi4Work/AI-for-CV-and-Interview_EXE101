package fpt.su26.exe101.backend.modules.quota.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.gallery.entity.UserUsageQuota;
import fpt.su26.exe101.backend.modules.gallery.repository.UserUsageQuotaRepository;
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

    private UserUsageQuota defaultQuota(UUID accountId) {
        return UserUsageQuota.builder().accountId(accountId).plan(UserPlan.FREE)
                .remainingCvCnt(1).remainingCvAiCnt(1).remainingIntMin(0).build();
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
}
