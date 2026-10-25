package fpt.su26.exe101.backend.base.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

@Service
@Slf4j
public class GmailApiEmailSender {
    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
    private final RestClient client;
    @Value("${app.email.gmail.client-id:}") private String clientId;
    @Value("${app.email.gmail.client-secret:}") private String clientSecret;
    @Value("${app.email.gmail.refresh-token:}") private String refreshToken;
    @Value("${app.email.gmail.sender:}") private String sender;
    private String accessToken;
    private Instant expiresAt = Instant.EPOCH;

    @Autowired
    public GmailApiEmailSender(RestClient.Builder builder) {
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(10000);
        this.client = builder.clone().requestFactory(factory).build();
    }

    GmailApiEmailSender(RestClient client) {
        this.client = client;
    }

    public void send(String to, String subject, String html) {
        if (clientId.isBlank() || clientSecret.isBlank() || refreshToken.isBlank() || sender.isBlank()) {
            log.error("[EMAIL] Gmail API configuration missing | required=GMAIL_CLIENT_ID,GMAIL_CLIENT_SECRET,GMAIL_REFRESH_TOKEN,GMAIL_SENDER_EMAIL");
            throw new IllegalStateException("Gmail API configuration is incomplete.");
        }
        String raw = encodeMessage(to, subject, html);
        try {
            String token = token();
            try {
                sendRaw(raw, token);
            } catch (RestClientResponseException e) {
                if (e.getStatusCode().value() != 401) throw e;
                // Only retry an explicit authentication rejection, never an ambiguous network failure.
                invalidate(token);
                sendRaw(raw, token());
            }
            log.info("[EMAIL] Message accepted | provider=gmail_api");
        } catch (RestClientResponseException e) {
            log.warn("[EMAIL] Gmail API rejected request | httpStatus={}", e.getStatusCode().value());
            // Response bodies/causes may contain tokens, recipients or message content.
            throw new IllegalStateException("Gmail API request rejected (HTTP " + e.getStatusCode().value()
                    + "). Check Gmail OAuth authorization and quota.");
        } catch (RestClientException e) {
            log.warn("[EMAIL] Gmail API connection failed | errorType={}", e.getClass().getSimpleName());
            throw new IllegalStateException("Gmail API is unavailable.");
        }
    }

    private String encodeMessage(String to, String subject, String html) {
        try {
            var message = new MimeMessage((Session) null);
            var helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setValidateAddresses(true);
            helper.setFrom(sender);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            message.saveChanges();
            var bytes = new ByteArrayOutputStream();
            message.writeTo(bytes);
            return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes.toByteArray());
        } catch (MessagingException | IOException e) {
            throw new IllegalStateException("Cannot construct email message.");
        }
    }

    private synchronized String token() {
        if (accessToken != null && Instant.now().isBefore(expiresAt)) return accessToken;
        var form = new LinkedMultiValueMap<String, String>();
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("refresh_token", refreshToken);
        form.add("grant_type", "refresh_token");
        var response = client.post().uri(TOKEN_URL).contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form).retrieve().body(TokenResponse.class);
        if (response == null || response.accessToken() == null || response.accessToken().isBlank()
                || response.expiresIn() <= 0 || !"Bearer".equalsIgnoreCase(response.tokenType())) {
            throw new IllegalStateException("Google did not return a valid access token.");
        }
        accessToken = response.accessToken();
        expiresAt = Instant.now().plusSeconds(Math.max(0, response.expiresIn() - 60));
        return accessToken;
    }

    private synchronized void invalidate(String rejectedToken) {
        if (rejectedToken.equals(accessToken)) {
            accessToken = null;
            expiresAt = Instant.EPOCH;
        }
    }

    private void sendRaw(String raw, String token) {
        var response = client.post().uri(SEND_URL).headers(h -> h.setBearerAuth(token))
                .contentType(MediaType.APPLICATION_JSON).body(Map.of("raw", raw))
                .retrieve().body(SendResponse.class);
        if (response == null || response.id() == null || response.id().isBlank()) {
            throw new IllegalStateException("Gmail did not acknowledge the email.");
        }
    }

    private record TokenResponse(@JsonProperty("access_token") String accessToken,
                                 @JsonProperty("expires_in") long expiresIn,
                                 @JsonProperty("token_type") String tokenType) {}
    private record SendResponse(String id) {}
}
