package fpt.su26.exe101.backend.base.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    private final JavaMailSender mailSender;

    @Async
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
            log.info("[EMAIL] Verification message sent");
        } catch (MessagingException e) {
            log.error("[EMAIL] Verification message delivery failed | errorType={}",
                    e.getClass().getSimpleName(), e);
            throw new RuntimeException("Email sending failed");
        }
    }

    public void sendResetPasswordEmail(String to, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String resetUrl = frontendUrl + "/reset-password?token=" + token;

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
            log.info("[EMAIL] Password reset message sent");
        } catch (MessagingException e) {
            log.error("[EMAIL] Password reset message delivery failed | errorType={}",
                    e.getClass().getSimpleName(), e);
            throw new RuntimeException("Email sending failed");
        }
    }

    @Async
    public void sendSubscriptionExpiredEmail(String to, String serviceName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("Gói " + serviceName + " đã hết hạn");
            helper.setText(
                    "<h3>Gói " + serviceName + " của bạn đã hết hạn</h3>" +
                    "<p>Chu kỳ dịch vụ đã kết thúc và quyền lợi trả phí đã tạm dừng.</p>" +
                    "<p><a href=\"" + frontendUrl + "/pricing\">Gia hạn gói dịch vụ</a></p>", true);
            mailSender.send(message);
            log.info("[EMAIL] Subscription expiration message sent | service={}", serviceName);
        } catch (MessagingException e) {
            log.error("[EMAIL] Subscription expiration message delivery failed | service={} | errorType={}",
                    serviceName, e.getClass().getSimpleName(), e);
            throw new RuntimeException("Email sending failed");
        }
    }
}
