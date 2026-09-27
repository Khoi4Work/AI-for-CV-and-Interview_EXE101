package fpt.su26.exe101.backend.modules.gallery.service.impl;

import fpt.su26.exe101.backend.base.persistence.Prompt;
import fpt.su26.exe101.backend.modules.gallery.dto.*;
import fpt.su26.exe101.backend.modules.gallery.service.AIProviderService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
public class GeminiAIProviderImpl implements AIProviderService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String jsonResponse(String prompt) {
        String response = chatClient.prompt(prompt + " Return only valid JSON without markdown fences.").call().content();
        if (response == null || response.isBlank()) throw new IllegalStateException("AI returned an empty response.");
        return response.trim().replaceFirst("^```(?:json)?\\s*", "").replaceFirst("\\s*```$", "");
    }

    public GeminiAIProviderImpl(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @Override
    public Map<String, Object> parseCVFile(byte[] fileContent, String contentType) {
        if (fileContent == null || fileContent.length == 0) {
            throw new IllegalArgumentException("CV file is empty.");
        }

        try {
            String extractedText = new Tika().parseToString(new ByteArrayInputStream(fileContent)).trim();
            if (extractedText.isEmpty()) {
                throw new IllegalArgumentException("No readable text was found in the CV file.");
            }

            String limitedText = extractedText.substring(0, Math.min(extractedText.length(), 30000));
            String modelResponse = chatClient.prompt(Prompt.cvImport(limitedText)).call().content();
            if (modelResponse == null || modelResponse.isBlank()) {
                throw new IllegalStateException("AI returned an empty response while importing the CV.");
            }

            String json = modelResponse.trim()
                    .replaceFirst("^```(?:json)?\\s*", "")
                    .replaceFirst("\\s*```$", "");
            Map<String, Object> result = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
            if (result == null) throw new IllegalArgumentException("AI could not identify valid CV data in the uploaded file.");
            return result;
        } catch (IOException | TikaException e) {
            throw new IllegalArgumentException("Unable to read the uploaded CV file.", e);
        }
    }

    @Override
    public CompletableFuture<CVOptimizationResultResponseDTO> optimizeCV(Map<String, Object> cvContent, String jdText) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Simulate AI processing time
                Thread.sleep(5000);

                // In reality, we'd build a complex prompt for Gemini
                String prompt = "Optimize this CV content: " + cvContent + " for this JD: " + jdText;
                String result = chatClient.prompt(prompt).call().content();

                return CVOptimizationResultResponseDTO.builder()
                        .optimizedContent(Map.of("optimized", "content based on " + result))
                        .improvementSummary("Improved keywords and impact statements.")
                        .predictedScore(85)
                        .build();
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        });
    }

    @Override
    public CVEvaluationResponseDTO evaluateCV(Map<String, Object> cvContent, String jdText) {
        try { return objectMapper.readValue(jsonResponse(Prompt.cvEvaluation(cvContent.toString(), jdText)), CVEvaluationResponseDTO.class); }
        catch (IOException e) { throw new IllegalStateException("AI returned invalid CV evaluation JSON.", e); }
    }

    @Override
    public CVFeedbackResponseDTO generateFeedback(Map<String, Object> cvContent, String jdText) {
        try { return objectMapper.readValue(jsonResponse(Prompt.cvFeedback(cvContent.toString(), jdText)), CVFeedbackResponseDTO.class); }
        catch (IOException e) { throw new IllegalStateException("AI returned invalid CV feedback JSON.", e); }
    }

    @Override
    public CVSkillGapResponseDTO analyzeSkillGap(Map<String, Object> cvContent, String jdText) {
        try { return objectMapper.readValue(jsonResponse(Prompt.cvSkillGap(cvContent.toString(), jdText)), CVSkillGapResponseDTO.class); }
        catch (IOException e) { throw new IllegalStateException("AI returned invalid skill-gap JSON.", e); }
    }
}
