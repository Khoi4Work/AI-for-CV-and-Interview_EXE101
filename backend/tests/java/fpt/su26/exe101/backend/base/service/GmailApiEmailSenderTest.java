package fpt.su26.exe101.backend.base.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.mock.http.client.MockClientHttpRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class GmailApiEmailSenderTest {
    private static final String TOKEN = "https://oauth2.googleapis.com/token";
    private static final String SEND = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
    private MockRestServiceServer server;
    private GmailApiEmailSender sender;

    @BeforeEach void setup() {
        var builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        sender = new GmailApiEmailSender(builder.build());
        ReflectionTestUtils.setField(sender, "clientId", "test-client");
        ReflectionTestUtils.setField(sender, "clientSecret", "test-secret");
        ReflectionTestUtils.setField(sender, "refreshToken", "test-refresh");
        ReflectionTestUtils.setField(sender, "sender", "sender@example.test");
    }

    private void refresh(String token) {
        server.expect(requestTo(TOKEN)).andExpect(method(HttpMethod.POST))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_FORM_URLENCODED))
                .andExpect(content().string("client_id=test-client&client_secret=test-secret&refresh_token=test-refresh&grant_type=refresh_token"))
                .andExpect(request -> assertFalse(request.getHeaders().containsKey("Authorization")))
                .andRespond(withSuccess("{\"access_token\":\"" + token
                        + "\",\"expires_in\":3600,\"token_type\":\"Bearer\"}", MediaType.APPLICATION_JSON));
    }

    private void accepted(String token) {
        server.expect(requestTo(SEND)).andExpect(header("Authorization", "Bearer " + token))
                .andRespond(withSuccess("{\"id\":\"message-1\"}", MediaType.APPLICATION_JSON));
    }

    @Test void refreshesAndSendsValidUtf8MimeMessage() {
        refresh("access-1");
        server.expect(requestTo(SEND)).andExpect(method(HttpMethod.POST))
                .andExpect(header("Authorization", "Bearer access-1"))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(request -> {
                    String body = ((MockClientHttpRequest) request).getBodyAsString();
                    String raw = new ObjectMapper().readTree(body).get("raw").asText();
                    assertFalse(raw.contains("="));
                    try {
                        var mime = new MimeMessage((Session) null,
                                new ByteArrayInputStream(Base64.getUrlDecoder().decode(raw)));
                        assertEquals("sender@example.test", mime.getFrom()[0].toString());
                        assertEquals("user@example.test", mime.getAllRecipients()[0].toString());
                        assertEquals("Xác minh tài khoản", mime.getSubject());
                        assertTrue(mime.isMimeType("text/html"));
                        assertEquals("<p>Xin chào</p>", mime.getContent());
                    } catch (Exception e) { throw new AssertionError(e); }
                }).andRespond(withSuccess("{\"id\":\"message-1\"}", MediaType.APPLICATION_JSON));
        sender.send("user@example.test", "Xác minh tài khoản", "<p>Xin chào</p>");
        server.verify();
    }

    @Test void reusesAccessTokenAcrossMessages() {
        refresh("cached"); accepted("cached"); accepted("cached");
        sender.send("user@example.test", "First", "body");
        sender.send("other@example.test", "Second", "body");
        server.verify();
    }

    @Test void expiredTokenIsRefreshed() {
        ReflectionTestUtils.setField(sender, "accessToken", "old");
        ReflectionTestUtils.setField(sender, "expiresAt", Instant.EPOCH);
        refresh("fresh"); accepted("fresh");
        sender.send("user@example.test", "Verify", "body");
        server.verify();
    }

    @Test void unauthorizedSendRefreshesOnceAndRetries() {
        refresh("old");
        server.expect(requestTo(SEND)).andExpect(header("Authorization", "Bearer old"))
                .andRespond(withStatus(HttpStatusCode.valueOf(401)));
        refresh("fresh"); accepted("fresh");
        sender.send("user@example.test", "Verify", "body");
        server.verify();
    }

    @Test void repeatedUnauthorizedSendStopsAfterOneRetry() {
        refresh("old");
        server.expect(requestTo(SEND)).andRespond(withStatus(HttpStatusCode.valueOf(401)));
        refresh("new");
        server.expect(requestTo(SEND)).andRespond(withStatus(HttpStatusCode.valueOf(401)));
        assertThrows(IllegalStateException.class, () -> sender.send("user@example.test", "Verify", "body"));
        server.verify();
    }

    @Test void revokedRefreshTokenPropagatesWithoutExposingSecrets() {
        server.expect(requestTo(TOKEN)).andRespond(withBadRequest()
                .body("{\"error\":\"invalid_grant\",\"private\":\"test-refresh\"}"));
        var error = assertThrows(IllegalStateException.class,
                () -> sender.send("user@example.test", "Verify", "body"));
        assertTrue(error.getMessage().contains("400"));
        assertFalse(error.getMessage().contains("test-refresh"));
        assertNull(error.getCause());
        server.verify();
    }

    @ParameterizedTest @ValueSource(ints = {403, 429, 500})
    void sendFailureIsNotSilentlyAccepted(int status) {
        refresh("token");
        server.expect(requestTo(SEND)).andRespond(withStatus(HttpStatusCode.valueOf(status)));
        assertThrows(IllegalStateException.class, () -> sender.send("user@example.test", "Verify", "body"));
        server.verify();
    }

    @Test void networkFailureIsNotRetriedImmediately() {
        refresh("token");
        server.expect(requestTo(SEND)).andRespond(withException(new IOException("timeout")));
        assertThrows(IllegalStateException.class, () -> sender.send("user@example.test", "Verify", "body"));
        server.verify();
    }

    @Test void missingConfigurationDoesNotMakeRequest() {
        ReflectionTestUtils.setField(sender, "refreshToken", "");
        assertThrows(IllegalStateException.class, () -> sender.send("user@example.test", "Verify", "body"));
        server.verify();
    }

    @Test void missingMessageIdIsNotAccepted() {
        refresh("token");
        server.expect(requestTo(SEND)).andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));
        assertThrows(IllegalStateException.class, () -> sender.send("user@example.test", "Verify", "body"));
        server.verify();
    }

    @Test void invalidTokenResponseDoesNotSendMail() {
        server.expect(requestTo(TOKEN)).andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));
        assertThrows(IllegalStateException.class, () -> sender.send("user@example.test", "Verify", "body"));
        server.verify();
    }
}
