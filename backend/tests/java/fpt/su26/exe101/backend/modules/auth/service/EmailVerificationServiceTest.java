package fpt.su26.exe101.backend.modules.auth.service;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.modules.auth.entity.*;
import fpt.su26.exe101.backend.modules.auth.entity.enums.AccountProvider;
import fpt.su26.exe101.backend.modules.auth.event.AccountCreatedEvent;
import fpt.su26.exe101.backend.modules.auth.repository.*;
import fpt.su26.exe101.backend.modules.auth.service.impl.EmailVerificationServiceImpl;
import fpt.su26.exe101.backend.modules.auth.service.impl.VerificationRateLimiterImpl;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import java.time.LocalDateTime;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailVerificationServiceTest {
    @Mock AccountRepository accounts;
    @Mock VerificationMailOutboxRepository outbox;
    @Mock VerificationRateLimiter limiter;
    @Mock ApplicationEventPublisher events;
    EmailVerificationService service;
    Account account;

    @BeforeEach void setup() {
        service = new EmailVerificationServiceImpl(accounts, outbox, limiter, events);
        account = Account.builder().email("user@example.com").provider(AccountProvider.LOCAL)
                .status("PENDING_VERIFICATION").build();
        account.setId(UUID.randomUUID());
    }

    @Test void issuancePersistsHashAndMailAtomicallyWithoutActivatingAccount() {
        service.issue(account);
        var mail = ArgumentCaptor.forClass(VerificationMailOutbox.class);
        verify(outbox).save(mail.capture());
        assertEquals(43, mail.getValue().getToken().length());
        assertNotEquals(mail.getValue().getToken(), account.getVerificationToken());
        assertEquals(EmailVerificationServiceImpl.hash(mail.getValue().getToken()), account.getVerificationToken());
        assertTrue(account.getVerificationExpiresAt().isAfter(LocalDateTime.now().plusHours(23)));
        assertNotNull(account.getVerificationManagedAt());
        assertEquals("PENDING_VERIFICATION", account.getStatus());
        verifyNoInteractions(events);
    }

    @Test void expiredLinkCannotActivate() {
        String raw = "a".repeat(43);
        account.setVerificationExpiresAt(LocalDateTime.now().minusSeconds(1));
        when(accounts.findLockedByVerificationToken(EmailVerificationServiceImpl.hash(raw))).thenReturn(Optional.of(account));
        assertThrows(ApiException.class, () -> service.verify(raw));
        assertEquals("PENDING_VERIFICATION", account.getStatus());
        verifyNoInteractions(events);
        verify(accounts, never()).save(any());
    }

    @Test void validLinkConsumesTokenAndProvisionsExactlyOnce() {
        String raw = "b".repeat(43);
        account.setVerificationToken(EmailVerificationServiceImpl.hash(raw));
        account.setVerificationExpiresAt(LocalDateTime.now().plusHours(1));
        when(accounts.findLockedByVerificationToken(EmailVerificationServiceImpl.hash(raw))).thenReturn(Optional.of(account));
        service.verify(raw);
        assertEquals("ACTIVE", account.getStatus());
        assertNull(account.getVerificationToken());
        assertNotNull(account.getVerifiedAt());
        verify(events).publishEvent(any(AccountCreatedEvent.class));
        assertThrows(ApiException.class, () -> service.verify(raw));
        verify(events, times(1)).publishEvent(any(AccountCreatedEvent.class));
    }

    @Test void resendNonexistentEmailHasNoMailSideEffects() {
        when(accounts.findLockedByEmail("nobody@example.com")).thenReturn(Optional.empty());
        service.resend("nobody@example.com", "127.0.0.1");
        verify(limiter).check("nobody@example.com", "127.0.0.1");
        verifyNoInteractions(outbox);
    }

    @Test void resendActiveAccountDoesNotRotateToken() {
        account.setStatus("ACTIVE");
        when(accounts.findLockedByEmail(account.getEmail())).thenReturn(Optional.of(account));
        service.resend(account.getEmail(), "127.0.0.1");
        verifyNoInteractions(outbox);
    }

    @Test void persistentHourlyLimitDoesNotQueueMoreMailAfterRestart() {
        when(accounts.findLockedByEmail(account.getEmail())).thenReturn(Optional.of(account));
        when(outbox.countRecent(eq(account.getId()), any())).thenReturn(5L);
        service.resend(account.getEmail(), "127.0.0.1");
        verify(outbox, never()).save(any());
    }

    @Test void resendInvalidatesOldTokenAndCanceledMailPayload() {
        account.setVerificationToken("old-hash");
        when(accounts.findLockedByEmail(account.getEmail())).thenReturn(Optional.of(account));
        service.resend(account.getEmail(), "127.0.0.1");
        assertNotEquals("old-hash", account.getVerificationToken());
        verify(outbox).cancelPending(account.getId());
        verify(outbox).save(any());
    }

    @Test void limiterEnforcesCooldownForNonexistentEmailsAndIpLimit() {
        VerificationRateLimiter realLimiter = new VerificationRateLimiterImpl();
        realLimiter.check("first@example.com", "127.0.0.1");
        assertThrows(ApiException.class, () -> realLimiter.check("first@example.com", "127.0.0.2"));
        for (int i = 1; i < 20; i++) realLimiter.check("other" + i + "@example.com", "127.0.0.1");
        assertThrows(ApiException.class, () -> realLimiter.check("last@example.com", "127.0.0.1"));
    }
}
