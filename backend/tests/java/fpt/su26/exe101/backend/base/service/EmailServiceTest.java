package fpt.su26.exe101.backend.base.service;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class EmailServiceTest {
    private final GmailApiEmailSender gmail = mock(GmailApiEmailSender.class);
    @SuppressWarnings("unchecked")
    private final ObjectProvider<JavaMailSender> smtp = mock(ObjectProvider.class);
    private EmailService email;

    @BeforeEach void setup() {
        email = new EmailService(smtp, gmail);
        ReflectionTestUtils.setField(email, "provider", "gmail_api");
        ReflectionTestUtils.setField(email, "frontendUrl", "https://smartfolio-exe101.vercel.app/");
        ReflectionTestUtils.setField(email, "backendUrl", "https://ai-for-cv-and-interview-exe101.onrender.com/");
    }

    @Test void allEmailTypesUseGmailAndPublicLinks() {
        email.sendVerificationEmail("user@example.test", "verify-token");
        email.sendResetPasswordEmail("user@example.test", "reset-token");
        email.sendSubscriptionExpiredEmail("user@example.test", "CV <Enhance>");
        verify(gmail).send(eq("user@example.test"), contains("Verify"),
                contains("https://ai-for-cv-and-interview-exe101.onrender.com/api/auth/verify-email?token=verify-token"));
        verify(gmail).send(eq("user@example.test"), contains("Reset"),
                contains("https://smartfolio-exe101.vercel.app/reset-password?token=reset-token"));
        verify(gmail).send(eq("user@example.test"), contains("đã hết hạn"),
                argThat(html -> html.contains("/pricing") && html.contains("CV &lt;Enhance&gt;")));
        verifyNoInteractions(smtp);
    }

    @Test void failurePropagatesWithoutFallingBackToSmtp() {
        doThrow(new IllegalStateException("unavailable")).when(gmail).send(any(), any(), any());
        assertThrows(IllegalStateException.class, () -> email.sendVerificationEmail("user@example.test", "token"));
        verifyNoInteractions(smtp);
    }

    @Test void explicitSmtpStillWorks() throws Exception {
        ReflectionTestUtils.setField(email, "provider", "smtp");
        ReflectionTestUtils.setField(email, "smtpFrom", "sender@example.test");
        var sender = mock(JavaMailSender.class);
        var message = new MimeMessage((Session) null);
        when(smtp.getIfAvailable()).thenReturn(sender);
        when(sender.createMimeMessage()).thenReturn(message);
        email.sendVerificationEmail("user@example.test", "token");
        verify(sender).send(message);
        assertEquals("sender@example.test", message.getFrom()[0].toString());
        verifyNoInteractions(gmail);
    }
}
