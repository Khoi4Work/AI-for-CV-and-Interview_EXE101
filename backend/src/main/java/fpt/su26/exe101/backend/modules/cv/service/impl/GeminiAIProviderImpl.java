package fpt.su26.exe101.backend.modules.cv.service.impl;

import fpt.su26.exe101.backend.base.persistence.Prompt;
import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.dto.response.*;
import fpt.su26.exe101.backend.modules.cv.service.AIProviderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;

import java.io.ByteArrayInputStream;
import java.io.IOException;
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
    public CVImportModelResponseDTO parseCVFile(byte[] fileContent, String contentType) {
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
            CVImportModelResponseDTO result = objectMapper.readValue(json, CVImportModelResponseDTO.class);
            if (result == null) throw new IllegalArgumentException("AI could not identify valid CV data in the uploaded file.");
            return result;
        } catch (IOException | TikaException e) {
            throw new IllegalArgumentException("Unable to read the uploaded CV file.", e);
        }
    }

    @Override
    public CompletableFuture<CVOptimizationResultResponseDTO> optimizeCV(CVContent cvContent, String jdText) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String contentJson = objectMapper.writeValueAsString(cvContent);
                return objectMapper.readValue(jsonResponse(Prompt.cvOptimization(contentJson, jdText)), CVOptimizationResultResponseDTO.class);
            } catch (IOException e) {
                throw new IllegalStateException("AI returned invalid CV optimization JSON.", e);
            }
        });
    }

    @Override
    public CVEvaluationResponseDTO evaluateCV(CVContent cvContent, String jdText) {
        try { return objectMapper.readValue(jsonResponse(Prompt.cvEvaluation(objectMapper.writeValueAsString(cvContent), jdText)), CVEvaluationResponseDTO.class); }
        catch (IOException e) { throw new IllegalStateException("AI returned invalid CV evaluation JSON.", e); }
    }

    @Override
    public CVFeedbackResponseDTO generateFeedback(CVContent cvContent, String jdText) {
        try { return objectMapper.readValue(jsonResponse(Prompt.cvFeedback(objectMapper.writeValueAsString(cvContent), jdText)), CVFeedbackResponseDTO.class); }
        catch (IOException e) { throw new IllegalStateException("AI returned invalid CV feedback JSON.", e); }
    }

    @Override
    public CVSkillGapResponseDTO analyzeSkillGap(CVContent cvContent, String jdText) {
        try { return objectMapper.readValue(jsonResponse(Prompt.cvSkillGap(objectMapper.writeValueAsString(cvContent), jdText)), CVSkillGapResponseDTO.class); }
        catch (IOException e) { throw new IllegalStateException("AI returned invalid skill-gap JSON.", e); }
    }
}
