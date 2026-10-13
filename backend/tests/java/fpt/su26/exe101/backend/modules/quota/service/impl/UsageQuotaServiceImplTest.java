package fpt.su26.exe101.backend.modules.quota.service.impl;

import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.modules.quota.config.QuotaBenefitConfig;
import fpt.su26.exe101.backend.modules.quota.entity.UserUsageQuota;
import fpt.su26.exe101.backend.modules.quota.repository.UserUsageQuotaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UsageQuotaServiceImplTest {
    private final UserUsageQuotaRepository repository = mock(UserUsageQuotaRepository.class);
    private final UsageQuotaServiceImpl service = new UsageQuotaServiceImpl(
            repository, mock(ApplicationEventPublisher.class), new QuotaBenefitConfig());

    @Test
    void creatingCvConsumesCreationCreditAndAssignsItsPerCvAnalysisAllowance() {
        UUID accountId = UUID.randomUUID();
        UserUsageQuota quota = quota(accountId, 1, 1);
        when(repository.findByAccountIdForUpdate(accountId)).thenReturn(Optional.of(quota));

        var allowance = service.consumeCvCreation(accountId);

        assertEquals(0, quota.getRemainingCvFreeCredits());
        assertEquals(UserPlan.FREE, allowance.plan());
        assertEquals(1, allowance.aiAnalysisLimit());
        assertEquals(1, allowance.aiAnalysisRemaining());
        assertEquals(0, quota.getRemainingCvAiCnt());
    }

    @Test
    void importCanReadPlanAllowanceWithoutConsumingCreationCredit() {
        UUID accountId = UUID.randomUUID();
        UserUsageQuota quota = quota(accountId, 0, 0);
        when(repository.findByAccountId(accountId)).thenReturn(Optional.of(quota));

        assertEquals(1, service.getCvAiAnalysisLimit(accountId));
        assertEquals(0, quota.getRemainingCvFreeCredits());
        assertEquals(0, quota.getRemainingCvAiCnt());
        verify(repository, never()).findByAccountIdForUpdate(accountId);
    }

    private UserUsageQuota quota(UUID accountId, int createCredits, int analysisCredits) {
        return UserUsageQuota.builder()
                .accountId(accountId)
                .remainingCvCnt(createCredits)
                .remainingCvFreeCredits(createCredits)
                .remainingCvAiCnt(analysisCredits)
                .remainingIntMin(5)
                .build();
    }
}
