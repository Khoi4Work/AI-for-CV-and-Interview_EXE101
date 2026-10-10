package fpt.su26.exe101.backend.modules.cv.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.base.persistence.Prompt;
import fpt.su26.exe101.backend.base.service.AIChatCompletionService;
import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.dto.response.*;
import fpt.su26.exe101.backend.modules.cv.service.AIProviderService;
import fpt.su26.exe101.backend.modules.cv.service.RoleTaxonomyService;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.concurrent.CompletableFuture;
import java.util.List;
import java.util.Set;
import java.util.Locale;
import org.apache.tika.exception.TikaException;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;

@Service
public class AIProviderServiceImpl implements AIProviderService {

    private static final int MAX_JSON_OUTPUT_TOKENS = 8192;
    private final AIChatCompletionService aiChatCompletionService;
    private final RoleTaxonomyService roleTaxonomy;
    private final ObjectMapper objectMapper;

    public AIProviderServiceImpl(
            AIChatCompletionService aiChatCompletionService,
            RoleTaxonomyService roleTaxonomy,
            ObjectMapper objectMapper) {
        this.aiChatCompletionService = aiChatCompletionService;
        this.roleTaxonomy = roleTaxonomy;
        this.objectMapper = objectMapper;
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
            String modelResponse = jsonResponse(Prompt.cvImport(limitedText), null, "cv-import");
            if (modelResponse == null || modelResponse.isBlank()) {
                throw new IllegalStateException("AI returned an empty response while importing the CV.");
            }

            String json = modelResponse.trim()
                    .replaceFirst("^```(?:json)?\\s*", "")
                    .replaceFirst("\\s*```$", "");
            CVImportModelResponseDTO result = objectMapper.readValue(json, CVImportModelResponseDTO.class);
            if (result == null)
                throw new IllegalArgumentException("AI could not identify valid CV data in the uploaded file.");
            if (result.getExtractedData() != null) {
                CVContent cv = result.getExtractedData();
                cv.setSourceText(limitedText);
                cv.setSourceTruncated(extractedText.length() > limitedText.length());
                String evidence = cv.getTargetRoleEvidence();
                if (!"EXPLICIT".equals(cv.getTargetRoleOrigin()) || evidence == null || evidence.isBlank()
                        || !limitedText.replaceAll("\\s+", " ").contains(evidence.replaceAll("\\s+", " "))
                        || cv.getProfessionalTitle() == null || cv.getProfessionalTitle().isBlank()
                        || historicalRoleEvidence(limitedText,evidence)) {
                    cv.setProfessionalTitle(""); cv.setTargetRoleOrigin("NONE"); cv.setTargetRoleEvidence(null);
                    cv.setTargetRoleCode(null);
                } else {
                    Set<String> roles = roleTaxonomy.roles(cv.getProfessionalTitle());
                    cv.setTargetRoleCode(roles.size() == 1 ? roles.iterator().next() : null);
                }
            }
            return result;
        } catch (IOException | TikaException e) {
            throw new IllegalArgumentException("Unable to read the uploaded CV file.", e);
        }
    }

    private boolean historicalRoleEvidence(String source,String quote) {
        String lower=source.toLowerCase(Locale.ROOT).replaceAll("\\s+"," ");
        String target=quote.toLowerCase(Locale.ROOT).replaceAll("\\s+"," ");
        if(target.matches("(?s).*(ứng tuyển|mong muốn|target role|applying for|desired position).*")) return false;
        int position=lower.indexOf(target);
        for(String heading:List.of("kinh nghiệm làm việc","work experience","employment history","professional experience")) {
            int history=lower.indexOf(heading);
            if(history>=0 && position>history) return true;
        }
        return false;
    }

    @Override
    public CompletableFuture<CVOptimizationResultResponseDTO> optimizeCV(CVContent cvContent, String jdText) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String contentJson = objectMapper.writeValueAsString(cvContent);
                return objectMapper.readValue(jsonResponse(Prompt.cvOptimization(contentJson, jdText), null, "cv-optimization"), CVOptimizationResultResponseDTO.class);
            } catch (IOException e) {
                throw new IllegalStateException("AI returned invalid CV optimization JSON.", e);
            }
        });
    }

    @Override
    public CVEvaluationResponseDTO evaluateCV(CVContent cvContent, String jdText, UserPlan plan) {
        try {
            String prompt = Prompt.cvEvaluation(objectMapper.writeValueAsString(cvContent), jdText, plan);
            return objectMapper.readValue(jsonResponse(prompt, Prompt.cvEvaluationResponseSchema(), "cv-evaluation"), CVEvaluationResponseDTO.class);
        } catch (IOException e) {
            throw new IllegalStateException("AI returned invalid CV evaluation JSON.", e);
        }
    }

    @Override
    public CVFeedbackResponseDTO generateFeedback(CVContent cvContent, String jdText) {
        try {
            return objectMapper.readValue(jsonResponse(Prompt.cvFeedback(objectMapper.writeValueAsString(cvContent), jdText), null, "cv-feedback"), CVFeedbackResponseDTO.class);
        } catch (IOException e) {
            throw new IllegalStateException("AI returned invalid CV feedback JSON.", e);
        }
    }

    @Override
    public CVSkillGapResponseDTO analyzeSkillGap(CVContent cvContent, String jdText) {
        try {
            return objectMapper.readValue(jsonResponse(Prompt.cvSkillGap(objectMapper.writeValueAsString(cvContent), jdText), null, "cv-skill-gap"), CVSkillGapResponseDTO.class);
        } catch (IOException e) {
            throw new IllegalStateException("AI returned invalid skill-gap JSON.", e);
        }
    }

    private String jsonResponse(String prompt, String responseSchema, String operation) {
        return aiChatCompletionService.generateJson(prompt, responseSchema, MAX_JSON_OUTPUT_TOKENS, "cv", operation);
    }
}
