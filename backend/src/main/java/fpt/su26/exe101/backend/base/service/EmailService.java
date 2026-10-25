package fpt.su26.exe101.backend.base.service;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    private final ObjectProvider<JavaMailSender> mailSender;
    private final GmailApiEmailSender gmail;
    @Value("${app.frontend.url:http://localhost:5173}") private String frontendUrl;
    @Value("${app.backend.url:http://localhost:8080}") private String backendUrl;
    @Value("${app.email.provider:gmail_api}") private String provider;
    @Value("${spring.mail.username:}") private String smtpFrom;

    public void sendVerificationEmail(String to, String token) {
        String url = backendUrl.replaceAll("/+$", "") + "/api/auth/verify-email?token=" + token;
        send(to, "Verify your account - AI for CV and Interview",
                "<h3>Welcome to AI for CV and Interview!</h3>"
                + "<p>Please click the link below to verify your email address:</p>"
                + "<p><a href=\"" + HtmlUtils.htmlEscape(url) + "\">Verify Email</a></p>"
                + "<p>If you didn't request this, please ignore this email.</p>");
    }

    public void sendResetPasswordEmail(String to, String token) {
        String url = frontendUrl.replaceAll("/+$", "") + "/reset-password?token=" + token;
        send(to, "Reset your password - AI for CV and Interview",
                "<h3>Password Reset Request</h3>"
                + "<p>We received a request to reset your password. Click the link below to set a new password:</p>"
                + "<p><a href=\"" + HtmlUtils.htmlEscape(url) + "\">Reset Password</a></p>"
                + "<p>If you didn't request this, please ignore this email.</p>");
    }

    @Async
    public void sendSubscriptionExpiredEmail(String to, String serviceName) {
        send(to, "Gói " + serviceName + " đã hết hạn",
                "<h3>Gói " + HtmlUtils.htmlEscape(serviceName) + " của bạn đã hết hạn</h3>"
                + "<p>Chu kỳ dịch vụ đã kết thúc và quyền lợi trả phí đã tạm dừng.</p>"
                + "<p><a href=\"" + HtmlUtils.htmlEscape(frontendUrl.replaceAll("/+$", "") + "/pricing")
                + "\">Gia hạn gói dịch vụ</a></p>");
    }

    private void send(String to, String subject, String html) {
        if ("gmail_api".equalsIgnoreCase(provider)) {
            gmail.send(to, subject, html);
            return;
        }
        if (!"smtp".equalsIgnoreCase(provider)) {
            throw new IllegalStateException("Unsupported EMAIL_PROVIDER; use gmail_api or smtp.");
        }
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null || smtpFrom.isBlank()) {
            throw new IllegalStateException("SMTP requires a mail sender and GOOGLE_EMAIL.");
        }
        try {
            var message = sender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(smtpFrom);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            sender.send(message);
            log.info("[EMAIL] Message accepted | provider=smtp");
        } catch (MessagingException e) {
            throw new IllegalStateException("Cannot construct email message.");
        }
    }
}
