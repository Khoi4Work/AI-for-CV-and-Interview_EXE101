package fpt.su26.exe101.backend.modules.interview.service.impl;

import com.fasterxml.jackson.annotation.JsonProperty;
import fpt.su26.exe101.backend.modules.interview.service.InterviewSttTokenService;
import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
@Slf4j
public class InterviewSttTokenServiceImpl implements InterviewSttTokenService {
    private final WebClient webClient;
    private final String apiKey;

    public InterviewSttTokenServiceImpl(
            @Value("${spring.ai.elevenlabs.api-key:}") String apiKey) {
        this.webClient = WebClient.builder().baseUrl("https://api.elevenlabs.io/v1").build();
        this.apiKey = apiKey;
    }

    @Override
    public String createSingleUseToken() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("ElevenLabs API key is not configured in the backend runtime.");
        }
        try {
            TokenResponse response = webClient.post()
                    .uri("/single-use-token/realtime_scribe")
                    .header("xi-api-key", apiKey.trim())
                    .retrieve()
                    .bodyToMono(TokenResponse.class)
                    .block(Duration.ofSeconds(15));
            if (response == null || response.token() == null || response.token().isBlank()) {
                throw new IllegalStateException("ElevenLabs returned an empty realtime STT token.");
            }
            return response.token();
        } catch (WebClientResponseException exception) {
            log.error("[INTERVIEW STT] Single-use token request failed | httpStatus={}",
                    exception.getStatusCode().value());
            throw new IllegalStateException("Realtime speech recognition is unavailable.", exception);
        }
    }

    private record TokenResponse(@JsonProperty("token") String token) {}
}
