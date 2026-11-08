package fpt.su26.exe101.backend.modules.interview.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.base.service.AIChatCompletionService;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewEvaluationResponseDTO;
import fpt.su26.exe101.backend.modules.interview.entity.enums.InterviewSuggestionPriority;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class InterviewAIProviderImplTest {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AIChatCompletionService ai = mock(AIChatCompletionService.class);
    private final InterviewAIProviderImpl provider = new InterviewAIProviderImpl(ai, objectMapper);

    @Test
    void includesFeedbackStyleAndPriorityRulesAndNormalizesSkippedAnswer() throws Exception {
        UUID skippedId = UUID.randomUUID();
        UUID answeredId = UUID.randomUUID();
        when(ai.generateJson(anyString(), isNull(), anyInt(), anyString(), anyString())).thenAnswer(invocation -> {
            String prompt = invocation.getArgument(0);
            assertTrue(prompt.contains("DIRECT"));
            assertTrue(prompt.contains("FOCUS_FIRST"));
            assertTrue(prompt.contains("score alone"));
            return evaluationJson(skippedId, answeredId, "FOCUS_FIRST");
        });
        var transcript = Map.<String, Object>of(
                "feedbackStyle", "DIRECT",
                "questionsAndAnswers", List.of(
                        Map.of("questionId", skippedId.toString(), "answer", "", "skipped", true),
                        Map.of("questionId", answeredId.toString(), "answer", "I reduced API latency by 30%.", "skipped", false,
                                "question", "Describe a measurable result", "gradingCriteria", Map.of("keyPoints", List.of("evidence")),
                                "interviewType", "BEHAVIORAL", "experienceLevel", "FRESHER")));

        InterviewEvaluationResponseDTO result = provider.evaluate(transcript, UserPlan.FREE);

        var skipped = result.getQuestionFeedback().get(0);
        assertEquals(0, skipped.getScore());
        assertEquals("Không có câu trả lời được ghi nhận nên chưa có bằng chứng để đánh giá.", skipped.getAssessment());
        assertEquals("", skipped.getImprovementSuggestion());
        assertNull(skipped.getSuggestionPriority());
        assertEquals(InterviewSuggestionPriority.FOCUS_FIRST,
                result.getQuestionFeedback().get(1).getSuggestionPriority());
    }

    @Test
    void rejectsUnknownModelPriority() throws Exception {
        UUID questionId = UUID.randomUUID();
        when(ai.generateJson(anyString(), isNull(), anyInt(), anyString(), anyString()))
                .thenReturn(evaluationJson(questionId, questionId, "MUST_HAVE"));
        var transcript = Map.<String, Object>of("questionsAndAnswers", List.of(
                Map.of("questionId", questionId.toString(), "answer", "An answer", "skipped", false)));

        assertThrows(IllegalStateException.class, () -> provider.evaluate(transcript, UserPlan.FREE));
    }

    private String evaluationJson(UUID skippedId, UUID answeredId, String priority) throws Exception {
        return """
                {"overallScore":50,"summary":"Summary","strengths":[],"improvementAreas":[],"recommendations":[],"criteria":[],
                 "questionFeedback":[
                   {"questionId":"%s","score":0,"assessment":"Model text","improvementSuggestion":"invented","suggestionPriority":"%s"},
                   {"questionId":"%s","score":40,"assessment":"Evidence observed","improvementSuggestion":"Add context","suggestionPriority":"%s"}
                 ]}
                """.formatted(skippedId, priority, answeredId, priority);
    }
}
