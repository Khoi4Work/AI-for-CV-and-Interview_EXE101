package fpt.su26.exe101.backend.base.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.ai.retry.TransientAiException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;
import jakarta.annotation.PostConstruct;

import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.util.Locale;
import java.util.concurrent.TimeoutException;

@Service
public class AIChatCompletionService {
    private static final Logger log = LoggerFactory.getLogger(AIChatCompletionService.class);

    private final ChatClient groqClient;
    private final ChatClient geminiClient;
    private final String primaryProvider;
    private final String groqModel;
    private final String geminiModel;

    public AIChatCompletionService(
            @Qualifier("groqChatClient") ChatClient groqClient,
            @Qualifier("geminiChatClient") ChatClient geminiClient,
            @Value("${ai.provider:groq}") String primaryProvider,
            @Value("${spring.ai.openai.chat.options.model}") String groqModel,
            @Value("${spring.ai.google.genai.chat.options.model}") String geminiModel) {
        String normalized = primaryProvider.trim().toLowerCase(Locale.ROOT);
        if (!normalized.equals("groq") && !normalized.equals("google") && !normalized.equals("gemini")) {
            throw new IllegalArgumentException("AI_PROVIDER must be 'groq', 'gemini', or 'google'.");
        }
        this.groqClient = groqClient;
        this.geminiClient = geminiClient;
        this.primaryProvider = normalized.equals("google") ? "gemini" : normalized;
        this.groqModel = groqModel;
        this.geminiModel = geminiModel;
    }

    @PostConstruct
    void logConfiguredProviders() {
        String fallbackProvider = primaryProvider.equals("groq") ? "gemini" : "groq";
        log.info("[AI] Providers configured | primaryProvider={} | primaryModel={} | fallbackProvider={} | fallbackModel={}",
                primaryProvider, modelFor(primaryProvider), fallbackProvider, modelFor(fallbackProvider));
    }

    public String generateJson(String prompt, String geminiResponseSchema, int maxTokens,
                               String module, String operation) {
        return generateJsonWithMetadata(prompt, geminiResponseSchema, maxTokens, module, operation).content();
    }

    public record Completion(String content, String provider, String model, int calls) {}

    public Completion generateJsonWithMetadata(String prompt, String geminiResponseSchema, int maxTokens,
                                               String module, String operation) {
        String fallbackProvider = primaryProvider.equals("groq") ? "gemini" : "groq";
        boolean deterministic = "cv".equals(module) && ("jd-requirements".equals(operation) || "evidence-extraction".equals(operation));
        try {
            log.info("[AI] Request started | provider={} | model={} | module={} | operation={}",
                    primaryProvider, modelFor(primaryProvider), module, operation);
            return new Completion(request(primaryProvider, prompt, geminiResponseSchema, maxTokens, deterministic), primaryProvider, modelFor(primaryProvider), 1);
        } catch (RuntimeException exception) {
            if (!shouldFallback(exception)) {
                log.error("[AI] Request failed | provider={} | model={} | module={} | operation={} | reason={}",
                        primaryProvider, modelFor(primaryProvider), module, operation, safeReason(exception));
                throw exception;
            }
            log.warn("[AI] Primary provider unavailable; trying fallback | primaryProvider={} | primaryModel={} | fallbackProvider={} | fallbackModel={} | module={} | operation={} | reason={}",
                    primaryProvider, modelFor(primaryProvider), fallbackProvider, modelFor(fallbackProvider),
                    module, operation, safeReason(exception));
            try {
                return new Completion(request(fallbackProvider, prompt, geminiResponseSchema, maxTokens, deterministic), fallbackProvider, modelFor(fallbackProvider), 2);
            } catch (RuntimeException fallbackException) {
                log.error("[AI] Fallback request failed | provider={} | model={} | module={} | operation={} | reason={}",
                        fallbackProvider, modelFor(fallbackProvider), module, operation, safeReason(fallbackException));
                fallbackException.addSuppressed(exception);
                throw fallbackException;
            }
        }
    }

    private String modelFor(String provider) {
        return provider.equals("groq") ? groqModel : geminiModel;
    }

    private String request(String provider, String prompt, String geminiResponseSchema, int maxTokens, boolean deterministic) {
        ChatClient client = provider.equals("groq") ? groqClient : geminiClient;
        ChatClient.ChatClientRequestSpec request = client.prompt(prompt);
        if (provider.equals("groq")) {
            request.options(OpenAiChatOptions.builder()
                    .temperature(deterministic ? 0.0 : null)
                    .maxTokens(maxTokens)
                    .build());
        } else {
            GoogleGenAiChatOptions.Builder options = GoogleGenAiChatOptions.builder()
                    .temperature(deterministic ? 0.0 : null)
                    .responseMimeType("application/json")
                    .maxOutputTokens(maxTokens);
            if (geminiResponseSchema != null) options.responseSchema(geminiResponseSchema);
            request.options(options.build());
        }

        String response = request.call().content();
        if (response == null || response.isBlank()) {
            throw new IllegalStateException("AI provider returned an empty response.");
        }
        return response.trim().replaceFirst("^```(?:json)?\\s*", "").replaceFirst("\\s*```$", "");
    }

    private boolean shouldFallback(Throwable failure) {
        for (Throwable current = failure; current != null; current = current.getCause()) {
            if (current instanceof TransientAiException || current instanceof ResourceAccessException
                    || current instanceof SocketTimeoutException
                    || current instanceof ConnectException || current instanceof TimeoutException) {
                return true;
            }
            if (current instanceof RestClientResponseException responseException) {
                HttpStatusCode status = responseException.getStatusCode();
                if (status.value() == 429 || status.is5xxServerError()) return true;
                if (status.value() == 402 && isInsufficientBalanceMessage(
                        responseException.getMessage() + " " + responseException.getResponseBodyAsString())) {
                    return true;
                }
            }
            if (current instanceof NonTransientAiException
                    && isInsufficientBalanceMessage(current.getMessage())) {
                return true;
            }
        }
        return false;
    }

    private String safeReason(Throwable failure) {
        Throwable root = failure;
        while (root.getCause() != null && root.getCause() != root) root = root.getCause();
        if (root instanceof RestClientResponseException responseException) {
            return "HTTP " + responseException.getStatusCode().value();
        }
        if (root instanceof NonTransientAiException) {
            String message = root.getMessage();
            if (message != null) {
                java.util.regex.Matcher matcher = java.util.regex.Pattern
                        .compile("(?i)HTTP\\s+(\\d{3})").matcher(message);
                if (matcher.find()) return "HTTP " + matcher.group(1);
                if (isInsufficientBalanceMessage(message)) return "INSUFFICIENT_BALANCE";
            }
        }
        return root.getClass().getSimpleName();
    }

    private boolean isInsufficientBalanceMessage(String message) {
        return message != null && (message.toLowerCase(Locale.ROOT).contains("insufficient balance")
                || message.matches("(?is).*HTTP\\s+402.*"));
    }
}
