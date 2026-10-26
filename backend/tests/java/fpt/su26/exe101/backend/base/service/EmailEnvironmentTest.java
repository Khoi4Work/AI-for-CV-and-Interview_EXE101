package fpt.su26.exe101.backend.base.service;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.support.ResourcePropertySource;
import org.springframework.mock.env.MockEnvironment;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class EmailEnvironmentTest {
    private MockEnvironment dev() throws IOException {
        var env = new MockEnvironment();
        env.getPropertySources().addLast(new ResourcePropertySource("classpath:application-dev.properties"));
        env.getPropertySources().addLast(new ResourcePropertySource("classpath:application.properties"));
        return env;
    }

    @Test void deployedDevUsesGmailApiAndPublicUrls() throws IOException {
        var env = dev().withProperty("FRONTEND_URL", "https://frontend.example.test")
                .withProperty("BACKEND_URL", "https://backend.example.test");
        assertEquals("gmail_api", env.getProperty("app.email.provider"));
        assertEquals("https://frontend.example.test", env.getProperty("app.frontend.url"));
        assertEquals("https://backend.example.test", env.getProperty("app.backend.url"));
        assertEquals("", env.getProperty("spring.mail.password"));
    }

    @Test void localOverridesAndSmtpOptionAreRespected() throws IOException {
        var env = dev().withProperty("EMAIL_PROVIDER", "smtp")
                .withProperty("FRONTEND_URL", "https://frontend.example.test")
                .withProperty("BACKEND_URL", "https://backend.example.test")
                .withProperty("DEV_FRONTEND_URL", "http://localhost:5173")
                .withProperty("DEV_BACKEND_URL", "http://localhost:8080");
        assertEquals("smtp", env.getProperty("app.email.provider"));
        assertEquals("http://localhost:5173", env.getProperty("app.frontend.url"));
        assertEquals("http://localhost:8080", env.getProperty("app.backend.url"));
    }
}
