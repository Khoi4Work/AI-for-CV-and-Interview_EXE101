package fpt.su26.exe101.backend.base.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendVerificationEmail(String to, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String verificationUrl = "http://localhost:8080/api/auth/verify-email?token=" + token;

            helper.setTo(to);
            helper.setSubject("Verify your account - AI for CV and Interview");
            helper.setText(
                "<h3>Welcome to AI for CV and Interview!</h3>" +
                "<p>Please click the link below to verify your email address:</p>" +
                "<p><a href=\"" + verificationUrl + "\">Verify Email</a></p>" +
                "<p>If you didn't request this, please ignore this email.</p>",
                true
            );

            mailSender.send(message);
            log.info("Verification email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send verification email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Email sending failed");
        }
    }

    public void sendResetPasswordEmail(String to, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String resetUrl = "http://localhost:8080/api/auth/reset-password?token=" + token;

            helper.setTo(to);
            helper.setSubject("Reset your password - AI for CV and Interview");
            helper.setText(
                "<h3>Password Reset Request</h3>" +
                "<p>We received a request to reset your password. Click the link below to set a new password:</p>" +
                "<p><a href=\"" + resetUrl + "\">Reset Password</a></p>" +
                "<p>If you didn't request this, please ignore this email.</p>",
                true
            );

            mailSender.send(message);
            log.info("Reset password email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send reset password email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Email sending failed");
        }
    }
}
