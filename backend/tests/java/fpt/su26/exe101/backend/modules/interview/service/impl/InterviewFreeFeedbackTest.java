package fpt.su26.exe101.backend.modules.interview.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.base.service.AIChatCompletionService;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class InterviewFreeFeedbackTest {
    @Test
    void freePlanReceivesBasicFeedbackWithoutEnhancedFields() {
        AIChatCompletionService ai = mock(AIChatCompletionService.class);
        when(ai.generateJson(anyString(), isNull(), anyInt(), eq("interview"), eq("interview-evaluation")))
                .thenReturn("""
                        {"overallScore":75,"summary":"Good start","strengths":["Clear answer"],
                         "improvementAreas":["Add examples"],"recommendations":["Advanced advice"],
                         "criteria":[{"criterion":"Clarity","score":75,"feedback":"Clear"}],
                         "questionFeedback":[]}
                        """);
        InterviewAIProviderImpl provider = new InterviewAIProviderImpl(ai, new ObjectMapper());

        var feedback = provider.evaluate(Map.of("questionsAndAnswers", java.util.List.of()), UserPlan.FREE);

        assertEquals(75, feedback.getOverallScore());
        assertEquals(java.util.List.of("Clear answer"), feedback.getStrengths());
        assertEquals(java.util.List.of("Add examples"), feedback.getImprovementAreas());
        assertTrue(feedback.getCriteria().isEmpty());
        assertTrue(feedback.getRecommendations().isEmpty());
    }
}
