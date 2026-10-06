package fpt.su26.exe101.backend.modules.auth.service.impl;

import fpt.su26.exe101.backend.base.service.EmailService;
import fpt.su26.exe101.backend.modules.auth.entity.*;
import fpt.su26.exe101.backend.modules.auth.repository.*;
import fpt.su26.exe101.backend.modules.auth.service.VerificationMailDelivery;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@Service @RequiredArgsConstructor @Slf4j
public class VerificationMailDeliveryImpl implements VerificationMailDelivery {
    private final AccountRepository accounts;
    private final VerificationMailOutboxRepository outbox;
    private final EmailService emailService;

    @Transactional
    public void deliver(UUID id) {
        VerificationMailOutbox candidate = outbox.findById(id).orElse(null);
        if (candidate == null) return;
        // All verify/resend/cleanup/delivery mutations serialize on the account row.
        Account account = accounts.findLockedById(candidate.getAccount().getId()).orElse(null);
        if (account == null) return;
        // The candidate may have been fetched before another transaction canceled it.
        outbox.flush();
        VerificationMailOutbox mail = outbox.findById(id).orElse(null);
        if (mail == null) return;
        // Query scalar fields afresh through refresh to avoid stale persistence-context state.
        refresh(mail);
        LocalDateTime now = LocalDateTime.now();
        if (mail.getSentAt() != null || mail.isCanceled() || mail.getNextAttemptAt().isAfter(now)) return;
        if (!"PENDING_VERIFICATION".equals(account.getStatus())
                || !mail.getTokenHash().equals(account.getVerificationToken())
                || account.getVerificationExpiresAt() == null || !account.getVerificationExpiresAt().isAfter(now)) {
            mail.setCanceled(true);
            mail.setToken(null);
            return;
        }
        try {
            emailService.sendVerificationEmail(account.getEmail(), mail.getToken());
            mail.setSentAt(now);
            mail.setToken(null);
            account.setVerificationLastSentAt(now);
        } catch (RuntimeException e) {
            int attempts = mail.getAttempts() + 1;
            mail.setAttempts(attempts);
            mail.setNextAttemptAt(now.plusMinutes(Math.min(60, 1L << Math.min(attempts, 6))));
            log.warn("[AUTH] Verification mail retry scheduled | mailId={} | attempt={} | errorType={}",
                    id, attempts, e.getClass().getSimpleName());
        }
    }

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;
    private void refresh(VerificationMailOutbox mail) { entityManager.refresh(mail); }
}
