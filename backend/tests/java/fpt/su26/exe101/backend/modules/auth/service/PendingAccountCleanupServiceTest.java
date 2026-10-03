package fpt.su26.exe101.backend.modules.auth.service;

import fpt.su26.exe101.backend.modules.auth.entity.Account;
import fpt.su26.exe101.backend.modules.auth.entity.enums.AccountProvider;
import fpt.su26.exe101.backend.modules.quota.config.QuotaBenefitConfig;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PendingAccountCleanupServiceTest {
    private final EntityManager em = mock(EntityManager.class);
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final LocalDateTime now = LocalDateTime.of(2026, 10, 3, 3, 0);
    private final UUID id = UUID.randomUUID();
    private PendingAccountCleanupService service;
    private Account account;

    @BeforeEach
    void setup() {
        service = new PendingAccountCleanupService(em, jdbc, new QuotaBenefitConfig(), 2, 24);
        account = Account.builder().provider(AccountProvider.LOCAL).status("PENDING_VERIFICATION")
                .verificationManagedAt(now.minusDays(2)).build();
        account.setId(id);
        account.setCreatedAt(now.minusDays(2));
        when(em.find(Account.class, id, LockModeType.PESSIMISTIC_WRITE)).thenReturn(account);
    }

    @Test
    void twoDaysIsRequiredForBothRegistrationAndLegacyMigrationGrace() {
        assertTrue(service.eligible(account, now));
        account.setCreatedAt(now.minusDays(2).plusSeconds(1));
        assertFalse(service.eligible(account, now));
        account.setCreatedAt(now.minusDays(30));
        account.setVerificationManagedAt(now.minusDays(2).plusSeconds(1));
        assertFalse(service.eligible(account, now));
        account.setVerificationManagedAt(null);
        assertFalse(service.eligible(account, now));
    }

    @Test
    void resendGraceAndUnexpiredLinkPreventDeletion() {
        account.setVerificationLastSentAt(now.minusHours(24).plusSeconds(1));
        assertFalse(service.eligible(account, now));
        account.setVerificationLastSentAt(now.minusHours(24));
        assertTrue(service.eligible(account, now));
        account.setVerificationExpiresAt(now.plusSeconds(1));
        assertFalse(service.eligible(account, now));
    }

    @Test
    void rechecksStatusUnderLockWhenVerificationWonTheRace() {
        account.setStatus("ACTIVE");
        assertEquals(PendingAccountCleanupService.Result.SKIPPED, service.cleanAccount(id, now, false));
        verifyNoInteractions(jdbc);
        verify(em, never()).remove(any());
    }

    @Test
    void oauthAndPreviouslyVerifiedAccountsAreNeverEligible() {
        account.setProvider(AccountProvider.GOOGLE);
        assertFalse(service.eligible(account, now));
        account.setProvider(AccountProvider.LOCAL);
        account.setVerifiedAt(now.minusDays(4));
        assertFalse(service.eligible(account, now));
    }

    @Test
    void businessDataOrChangedQuotaPreventsAllDeletes() {
        when(jdbc.queryForObject(anyString(), eq(Boolean.class), any(Object[].class))).thenReturn(true);
        assertEquals(PendingAccountCleanupService.Result.SKIPPED, service.cleanAccount(id, now, false));
        verify(em, never()).remove(any());
        verify(jdbc, never()).update(anyString(), any(Object[].class));
    }

    @Test
    void dryRunChecksSafetyButDoesNotMutate() {
        when(jdbc.queryForObject(anyString(), eq(Boolean.class), any(Object[].class))).thenReturn(false);
        assertEquals(PendingAccountCleanupService.Result.WOULD_DELETE, service.cleanAccount(id, now, true));
        verify(em, never()).remove(any());
        verify(jdbc, never()).update(anyString(), any(Object[].class));
    }

    @Test
    void deletesOnlyShellDependentsBeforeAccountAndFlushesToDetectForeignKeys() {
        when(jdbc.queryForObject(anyString(), eq(Boolean.class), any(Object[].class))).thenReturn(false);
        assertEquals(PendingAccountCleanupService.Result.DELETED, service.cleanAccount(id, now, false));
        InOrder order = inOrder(jdbc, em);
        order.verify(jdbc).update("DELETE FROM verification_mail_outbox WHERE account_id = ?", id);
        order.verify(jdbc).update("DELETE FROM attendance_info WHERE attendance_id IN (SELECT id FROM attendance WHERE account_id = ?)", id);
        order.verify(jdbc).update("DELETE FROM partner_info WHERE partner_id IN (SELECT id FROM partner WHERE account_id = ?)", id);
        order.verify(jdbc).update("DELETE FROM attendance WHERE account_id = ?", id);
        order.verify(jdbc).update("DELETE FROM partner WHERE account_id = ?", id);
        order.verify(jdbc).update("DELETE FROM gallery WHERE account_id = ?", id);
        order.verify(jdbc).update("DELETE FROM user_usage_quotas WHERE account_id = ?", id);
        order.verify(em).remove(account);
        order.verify(em).flush();
    }
}
