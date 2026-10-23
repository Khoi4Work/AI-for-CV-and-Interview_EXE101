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
import fpt.su26.exe101.backend.base.service.AIChatCompletionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class InterviewAIProviderImpl implements InterviewAIProvider {
    private static final int MAX_JSON_OUTPUT_TOKENS = 8192;
    private final AIChatCompletionService aiChatCompletionService;
    private final ObjectMapper objectMapper;

    @Override
    public InterviewEvaluationResponseDTO evaluate(Map<String, Object> transcript, UserPlan plan) {
        try {
            String transcriptJson = objectMapper.writeValueAsString(transcript);
            String response = aiChatCompletionService.generateJson(
                    Prompt.interviewEvaluation(transcriptJson, plan), null, MAX_JSON_OUTPUT_TOKENS,
                    "interview", "interview-evaluation");
            InterviewEvaluationResponseDTO evaluation = objectMapper.readValue(
                    response.trim().replaceFirst("^```(?:json)?\\s*", "").replaceFirst("\\s*```$", ""),
                    InterviewEvaluationResponseDTO.class);
            enforcePlanFields(evaluation, plan);
            normalizeQuestionScores(evaluation, transcript);
            validateEvaluation(evaluation, plan);
            return evaluation;
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("AI returned invalid interview evaluation JSON.", exception);
        }
    }

    /** Ensures every asked question contributes equally and unanswered questions cannot inherit an AI-generated score. */
    private void normalizeQuestionScores(InterviewEvaluationResponseDTO evaluation, Map<String, Object> transcript) {
        if (evaluation == null) return;
        Object rawQuestions = transcript.get("questionsAndAnswers");
        if (!(rawQuestions instanceof List<?> questions) || questions.isEmpty()) return;

        Map<String, InterviewEvaluationResponseDTO.QuestionFeedback> feedbackByQuestion = new HashMap<>();
        if (evaluation.getQuestionFeedback() != null) {
            evaluation.getQuestionFeedback().forEach(item -> {
                if (item != null && item.getQuestionId() != null) {
                    feedbackByQuestion.put(item.getQuestionId().toString(), item);
                }
            });
        }

        List<InterviewEvaluationResponseDTO.QuestionFeedback> normalized = new ArrayList<>();
        Map<String, List<Integer>> scoresByCompetency = new HashMap<>();
        for (Object rawQuestion : questions) {
            if (!(rawQuestion instanceof Map<?, ?> question)) continue;
            Object rawId = question.get("questionId");
            if (rawId == null) continue;
            String questionId = String.valueOf(rawId);
            Object rawAnswer = question.get("answer");
            boolean hasAnswer = rawAnswer != null && !String.valueOf(rawAnswer).isBlank()
                    && !Boolean.TRUE.equals(question.get("skipped"));
            InterviewEvaluationResponseDTO.QuestionFeedback item = feedbackByQuestion.get(questionId);
            if (item == null) {
                if (hasAnswer) {
                    throw new IllegalStateException("AI omitted feedback for an answered interview question.");
                }
                item = new InterviewEvaluationResponseDTO.QuestionFeedback();
                item.setQuestionId(java.util.UUID.fromString(questionId));
                item.setAssessment("Không có câu trả lời được ghi nhận nên chưa có bằng chứng để đánh giá.");
                item.setImprovementSuggestion("");
            }

            boolean unanswered = Boolean.TRUE.equals(question.get("unanswered"))
                    || Boolean.TRUE.equals(question.get("skipped")) || !hasAnswer;
            int score = unanswered || item.getScore() == null ? 0 : item.getScore();
            item.setScore(score);
            normalized.add(item);
            Object rawCompetency = question.get("competency");
            String competency = rawCompetency == null || String.valueOf(rawCompetency).isBlank()
                    ? questionId
                    : String.valueOf(rawCompetency).trim();
            scoresByCompetency.computeIfAbsent(competency, ignored -> new ArrayList<>()).add(score);
        }

        if (!normalized.isEmpty()) {
            evaluation.setQuestionFeedback(normalized);
            double competencyScoreTotal = scoresByCompetency.values().stream()
                    .mapToDouble(scores -> scores.stream().mapToInt(Integer::intValue).average().orElse(0))
                    .sum();
            evaluation.setOverallScore((int) Math.round(competencyScoreTotal / scoresByCompetency.size()));
        }
    }

    private void enforcePlanFields(InterviewEvaluationResponseDTO evaluation, UserPlan plan) {
        if (evaluation != null && plan != UserPlan.ENHANCE) {
            // The plan, not model compliance, controls which feedback fields are exposed.
            evaluation.setRecommendations(java.util.List.of());
            evaluation.setCriteria(java.util.List.of());
        }
    }

    @Override
    public InterviewQuestionGenerationDTO generateQuestions(InterviewType type, ExperienceLevel level, int count,
                                                            String language, String candidateContext) {
        try {
            String response = aiChatCompletionService.generateJson(
                    Prompt.interviewQuestionGeneration(type, level, count, language, candidateContext), null,
                    MAX_JSON_OUTPUT_TOKENS, "interview", "question-generation");
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

    @Override public InterviewQuestionGenerationDTO generateSessionQuestions(InterviewType type,ExperienceLevel level,int count,
            String language,String candidateContext,String jdContext,String companyContext) {
        try {
            String response=aiChatCompletionService.generateJson(Prompt.interviewSessionQuestions(type,level,count,language,candidateContext,jdContext,companyContext),
                null,MAX_JSON_OUTPUT_TOKENS,"interview","session-question-generation");
            var generated=objectMapper.readValue(response,InterviewQuestionGenerationDTO.class);
            validateGeneratedQuestions(generated,count);return generated;
        } catch(JsonProcessingException e){throw new IllegalStateException("AI returned invalid session questions.",e);}
    }

    private void validateEvaluation(InterviewEvaluationResponseDTO evaluation, UserPlan plan) {
        if (evaluation == null || evaluation.getOverallScore() == null
                || evaluation.getOverallScore() < 0 || evaluation.getOverallScore() > 100
                || evaluation.getSummary() == null || evaluation.getStrengths() == null
                || evaluation.getImprovementAreas() == null || evaluation.getRecommendations() == null
                || evaluation.getCriteria() == null || evaluation.getQuestionFeedback() == null) {
            throw new IllegalStateException("AI returned incomplete interview evaluation data.");
        }
        if (plan != UserPlan.ENHANCE && (!evaluation.getCriteria().isEmpty()
                || !evaluation.getRecommendations().isEmpty())) {
            throw new IllegalStateException("AI returned feedback fields outside the basic feedback tier.");
        }
        boolean invalidScore = evaluation.getCriteria().stream().anyMatch(item -> item.getScore() == null
                || item.getScore() < 0 || item.getScore() > 100)
                || evaluation.getQuestionFeedback().stream().anyMatch(item -> item.getScore() == null
                || item.getScore() < 0 || item.getScore() > 100);
        if (invalidScore) throw new IllegalStateException("AI returned an out-of-range interview score.");
    }
}
