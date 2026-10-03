package fpt.su26.exe101.backend.modules.auth.service;

import fpt.su26.exe101.backend.base.service.EmailService;
import fpt.su26.exe101.backend.modules.auth.entity.*;
import fpt.su26.exe101.backend.modules.auth.repository.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import java.time.LocalDateTime;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VerificationMailDeliveryTest {
    @Mock AccountRepository accounts;
    @Mock VerificationMailOutboxRepository outbox;
    @Mock EmailService email;
    @Mock EntityManager entityManager;
    VerificationMailDelivery delivery;
    Account account;
    VerificationMailOutbox mail;
    UUID id = UUID.randomUUID();

    @BeforeEach void setup() {
        delivery = new VerificationMailDelivery(accounts, outbox, email);
        ReflectionTestUtils.setField(delivery, "entityManager", entityManager);
        account = Account.builder().email("user@example.com").status("PENDING_VERIFICATION").verificationToken("hash").build();
        account.setId(UUID.randomUUID());
        account.setVerificationExpiresAt(LocalDateTime.now().plusHours(24));
        mail = new VerificationMailOutbox();
        mail.setAccount(account);
        mail.setToken("raw");
        mail.setTokenHash("hash");
        mail.setNextAttemptAt(LocalDateTime.now().minusSeconds(1));
        when(outbox.findById(id)).thenReturn(Optional.of(mail));
        when(accounts.findLockedById(account.getId())).thenReturn(Optional.of(account));
    }

    @Test void successfulDeliveryErasesTokenAndRecordsLastSent() {
        delivery.deliver(id);
        verify(email).sendVerificationEmail(account.getEmail(), "raw");
        assertNull(mail.getToken());
        assertNotNull(mail.getSentAt());
        assertNotNull(account.getVerificationLastSentAt());
    }

    @Test void smtpFailureKeepsJobForRetryWithoutClaimingSent() {
        doThrow(new RuntimeException("SMTP unavailable")).when(email).sendVerificationEmail(any(), any());
        delivery.deliver(id);
        assertNull(mail.getSentAt());
        assertEquals(1, mail.getAttempts());
        assertNotNull(mail.getToken());
        assertTrue(mail.getNextAttemptAt().isAfter(LocalDateTime.now()));
        assertNull(account.getVerificationLastSentAt());
    }

    @Test void rotatedTokenCancelsOldMailAndErasesPayload() {
        account.setVerificationToken("new-hash");
        delivery.deliver(id);
        verifyNoInteractions(email);
        assertTrue(mail.isCanceled());
        assertNull(mail.getToken());
    }
}
