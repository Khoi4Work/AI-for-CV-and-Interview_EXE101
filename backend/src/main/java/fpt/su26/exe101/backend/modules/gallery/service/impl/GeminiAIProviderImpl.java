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
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
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
        String prompt = "Evaluate this CV: " + cvContent + " against this JD: " + jdText + ". Return a score (0-100) and analysis.";
        String result = chatClient.prompt(prompt).call().content();

        return CVEvaluationResponseDTO.builder()
                .score(75)
                .atsCompatibility(80)
                .analysis(CVEvaluationResponseDTO.Analysis.builder()
                        .strengths(List.of("Strong technical skills"))
                        .weaknesses(List.of("Lack of quantifiable achievements"))
                        .suggestions(List.of("Add more metrics to experience"))
                        .build())
                .build();
    }

    @Override
    public CVFeedbackResponseDTO generateFeedback(Map<String, Object> cvContent, String jdText) {
        String prompt = "Provide a SWOT analysis and section-by-section feedback for this CV: " + cvContent + " vs JD: " + jdText;
        String result = chatClient.prompt(prompt).call().content();

        return CVFeedbackResponseDTO.builder()
                .id(1L)
                .overallScore(70)
                .feedback(CVFeedbackResponseDTO.Feedback.builder()
                        .swot(Map.of("Strengths", "...", "Weaknesses", "...", "Opportunities", "...", "Threats", "..."))
                        .sectionAnalysis(Map.of("Experience", "Good but needs more impact"))
                        .build())
                .createdAt(java.time.LocalDateTime.now())
                .build();
    }

    @Override
    public CVSkillGapResponseDTO analyzeSkillGap(Map<String, Object> cvContent, String jdText) {
        String prompt = "Identify skill gaps between this CV: " + cvContent + " and JD: " + jdText;
        String result = chatClient.prompt(prompt).call().content();

        return CVSkillGapResponseDTO.builder()
                .matchingSkills(List.of("Java", "Spring Boot"))
                .missingSkills(List.of("AWS", "Kubernetes"))
                .build();
    }
}
