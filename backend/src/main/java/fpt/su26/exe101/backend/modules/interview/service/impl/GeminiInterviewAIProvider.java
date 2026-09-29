package fpt.su26.exe101.backend.modules.interview.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.base.persistence.Prompt;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewEvaluationResponseDTO;
import fpt.su26.exe101.backend.modules.interview.dto.InterviewQuestionGenerationDTO;
import fpt.su26.exe101.backend.modules.interview.entity.enums.ExperienceLevel;
import fpt.su26.exe101.backend.modules.interview.entity.enums.InterviewType;
import fpt.su26.exe101.backend.modules.interview.service.InterviewAIProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class GeminiInterviewAIProvider implements InterviewAIProvider {
    private static final int MAX_JSON_OUTPUT_TOKENS = 8192;
    private final ChatClient.Builder chatClientBuilder;
    private final ObjectMapper objectMapper;

    @Override
    public InterviewEvaluationResponseDTO evaluate(Map<String, Object> transcript, UserPlan plan) {
        try {
            ChatClient chatClient = chatClientBuilder.build();
            String transcriptJson = objectMapper.writeValueAsString(transcript);
            String response = chatClient.prompt(Prompt.interviewEvaluation(transcriptJson, plan))
                    .options(GoogleGenAiChatOptions.builder()
                            .responseMimeType("application/json")
                            .maxOutputTokens(MAX_JSON_OUTPUT_TOKENS)
                            .build())
                    .call()
                    .content();
            if (response == null || response.isBlank()) {
                throw new IllegalStateException("AI returned an empty interview evaluation.");
            }
            InterviewEvaluationResponseDTO evaluation = objectMapper.readValue(
                    response.trim().replaceFirst("^```(?:json)?\\s*", "").replaceFirst("\\s*```$", ""),
                    InterviewEvaluationResponseDTO.class);
            validateEvaluation(evaluation, plan);
            return evaluation;
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("AI returned invalid interview evaluation JSON.", exception);
        }
    }

    @Override
    public InterviewQuestionGenerationDTO generateQuestions(InterviewType type, ExperienceLevel level, int count) {
        try {
            String response = chatClientBuilder.build()
                    .prompt(Prompt.interviewQuestionGeneration(type, level, count))
                    .options(GoogleGenAiChatOptions.builder()
                            .responseMimeType("application/json")
                            .maxOutputTokens(MAX_JSON_OUTPUT_TOKENS)
                            .build())
                    .call()
                    .content();
            if (response == null || response.isBlank()) {
                throw new IllegalStateException("AI returned an empty interview question set.");
            }
            InterviewQuestionGenerationDTO generated = objectMapper.readValue(
                    response.trim().replaceFirst("^```(?:json)?\\s*", "").replaceFirst("\\s*```$", ""),
                    InterviewQuestionGenerationDTO.class);
            validateGeneratedQuestions(generated, count);
            return generated;
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("AI returned invalid interview question JSON.", exception);
        }
    }

    private void validateGeneratedQuestions(InterviewQuestionGenerationDTO generated, int expectedCount) {
        if (generated == null || generated.getQuestions() == null || generated.getQuestions().size() != expectedCount) {
            throw new IllegalStateException("AI returned an incomplete interview question set.");
        }
        Set<String> uniqueQuestions = new HashSet<>();
        for (InterviewQuestionGenerationDTO.QuestionDraft question : generated.getQuestions()) {
            if (question.getText() == null || question.getText().isBlank()
                    || question.getCategory() == null || question.getCategory().isBlank()
                    || question.getCompetency() == null || question.getCompetency().isBlank()
                    || question.getSampleAnswer() == null || question.getGradingCriteria() == null) {
                throw new IllegalStateException("AI returned an interview question missing required fields.");
            }
            if (!uniqueQuestions.add(question.getText().trim().toLowerCase())) {
                throw new IllegalStateException("AI returned duplicate interview questions.");
            }
        }
    }

    private void validateEvaluation(InterviewEvaluationResponseDTO evaluation, UserPlan plan) {
        if (evaluation == null || evaluation.getOverallScore() == null
                || evaluation.getOverallScore() < 0 || evaluation.getOverallScore() > 100
                || evaluation.getSummary() == null || evaluation.getStrengths() == null
                || evaluation.getImprovementAreas() == null || evaluation.getRecommendations() == null
                || evaluation.getCriteria() == null || evaluation.getQuestionFeedback() == null) {
            throw new IllegalStateException("AI returned incomplete interview evaluation data.");
        }
        if (plan == UserPlan.MIDDLE && (!evaluation.getCriteria().isEmpty()
                || !evaluation.getQuestionFeedback().isEmpty()
                || !evaluation.getRecommendations().isEmpty())) {
            throw new IllegalStateException("AI returned feedback fields outside the MIDDLE plan tier.");
        }
        boolean invalidScore = evaluation.getCriteria().stream().anyMatch(item -> item.getScore() == null
                || item.getScore() < 0 || item.getScore() > 100)
                || evaluation.getQuestionFeedback().stream().anyMatch(item -> item.getScore() == null
                || item.getScore() < 0 || item.getScore() > 100);
        if (invalidScore) throw new IllegalStateException("AI returned an out-of-range interview score.");
    }
}
