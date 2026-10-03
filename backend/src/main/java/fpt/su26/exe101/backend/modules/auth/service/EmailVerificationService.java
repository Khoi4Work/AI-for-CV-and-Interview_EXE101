package fpt.su26.exe101.backend.modules.auth.service;

import fpt.su26.exe101.backend.base.exception.*;
import fpt.su26.exe101.backend.modules.auth.entity.*;
import fpt.su26.exe101.backend.modules.auth.entity.enums.AccountProvider;
import fpt.su26.exe101.backend.modules.auth.event.AccountCreatedEvent;
import fpt.su26.exe101.backend.modules.auth.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.security.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service @RequiredArgsConstructor
public class EmailVerificationService {
    private final AccountRepository accounts;
    private final VerificationMailOutboxRepository outbox;
    private final VerificationRateLimiter limiter;
    private final ApplicationEventPublisher events;
    private final SecureRandom random = new SecureRandom();
    @Value("${app.auth.verification.expiry-hours:24}")
    private long expiryHours = 24;

    @Transactional
    public void issue(Account account) {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        LocalDateTime now = LocalDateTime.now();
        outbox.cancelPending(account.getId());
        account.setVerificationToken(hash(token));
        account.setVerificationExpiresAt(now.plusHours(expiryHours));
        if (account.getVerificationManagedAt() == null) account.setVerificationManagedAt(now);
        accounts.save(account);
        VerificationMailOutbox mail = new VerificationMailOutbox();
        mail.setAccount(account);
        mail.setToken(token);
        mail.setTokenHash(account.getVerificationToken());
        mail.setNextAttemptAt(now);
        outbox.save(mail);
    }

    @Transactional
    public void resend(String email, String ip) {
        if (email == null || email.length() > 254 || !email.trim().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Email không hợp lệ.");
        }
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        limiter.check(normalized, ip);
        accounts.findLockedByEmail(normalized).filter(this::isPendingLocal).ifPresent(account -> {
            // Database guard preserves cooldown even after an application restart.
            LocalDateTime now = LocalDateTime.now();
            if (outbox.countRecent(account.getId(), now.minusHours(1)) >= 5
                    || outbox.countRecent(account.getId(), now.minusSeconds(60)) > 0) return;
            if (account.getVerificationLastSentAt() != null
                    && account.getVerificationLastSentAt().isAfter(now.minusSeconds(60))) return;
            issue(account);
        });
    }

    @Transactional
    public void verify(String token) {
        if (token == null || token.length() != 43) invalid();
        Account account = accounts.findLockedByVerificationToken(hash(token))
                .orElseThrow(() -> new ApiException(ErrorCode.VERIFY_TOKEN_INVALID));
        LocalDateTime now = LocalDateTime.now();
        if (!isPendingLocal(account) || account.getVerificationExpiresAt() == null
                || !account.getVerificationExpiresAt().isAfter(now)) invalid();
        account.setStatus("ACTIVE");
        account.setVerificationToken(null);
        account.setVerificationExpiresAt(null);
        account.setVerifiedAt(now);
        outbox.cancelPending(account.getId());
        accounts.save(account);
        events.publishEvent(new AccountCreatedEvent(account.getId()));
    }

    public boolean isPendingLocal(Account account) {
        return account.getProvider() == AccountProvider.LOCAL && "PENDING_VERIFICATION".equals(account.getStatus());
    }

    public static String hash(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }

    private void invalid() { throw new ApiException(ErrorCode.VERIFY_TOKEN_INVALID, "Link xác thực không hợp lệ hoặc đã hết hạn."); }
}
