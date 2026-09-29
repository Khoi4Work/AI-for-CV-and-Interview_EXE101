package fpt.su26.exe101.backend.modules.quota.listener;

import fpt.su26.exe101.backend.modules.auth.event.AccountCreatedEvent;
import fpt.su26.exe101.backend.modules.quota.event.QuotaInitializationRequestedEvent;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.*;

@Component @RequiredArgsConstructor @Slf4j
public class QuotaAccountCreatedListener {
    private final UsageQuotaService quotaService;
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onAccountCreated(AccountCreatedEvent event) {
        initializeQuota(event.accountId());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onQuotaInitializationRequested(QuotaInitializationRequestedEvent event) {
        initializeQuota(event.accountId());
    }

    private void initializeQuota(java.util.UUID accountId) {
        try {
            quotaService.initializeDefaultQuota(accountId);
        } catch (Exception e) {
            log.error("Failed to initialize shared quota for account {}", accountId, e);
        }
    }
}
