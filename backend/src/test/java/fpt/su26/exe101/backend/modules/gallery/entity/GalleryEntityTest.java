package fpt.su26.exe101.backend.modules.gallery.entity;

import fpt.su26.exe101.backend.modules.gallery.entity.enums.InterviewType;
import fpt.su26.exe101.backend.modules.gallery.entity.enums.OptimizationState;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class GalleryEntityTest {

    @Test
    @DisplayName("Gallery - Builder and Mapping Test")
    void testGalleryBuilder() {
        UUID accountId = UUID.randomUUID();
        Gallery gallery = Gallery.builder()
                .accountId(accountId)
                .build();

        assertNotNull(gallery);
        assertEquals(accountId, gallery.getAccountId());
    }

    @Test
    @DisplayName("CVs - Builder Default Values and JSONB Mapping Test")
    void testCVsBuilder() {
        UUID galleryId = UUID.randomUUID();
        Map<String, Object> content = new HashMap<>();
        content.put("experience", "5 years");
        content.put("skills", List.of("Java", "Spring"));

        CVs cv = CVs.builder()
                .galleryId(galleryId)
                .name("Test CV")
                .content(content)
                .build();

        assertNotNull(cv);
        assertEquals(galleryId, cv.getGalleryId());
        assertEquals("Test CV", cv.getName());
        assertEquals(content, cv.getContent());

        // Verify @Builder.Default
        assertEquals(OptimizationState.DRAFT, cv.getOptimizationState(), "OptimizationState should default to DRAFT");
        assertEquals("DRAFT", cv.getStatus(), "Status should default to DRAFT");
    }

    @Test
    @DisplayName("JobDescriptions - Builder and Mapping Test")
    void testJobDescriptionsBuilder() {
        UUID galleryId = UUID.randomUUID();
        JobDescriptions jd = JobDescriptions.builder()
                .galleryId(galleryId)
                .title("Software Engineer")
                .content("Requirements: Java, Spring Boot")
                .companyName("Tech Corp")
                .build();

        assertNotNull(jd);
        assertEquals(galleryId, jd.getGalleryId());
        assertEquals("Software Engineer", jd.getTitle());
        assertEquals("Requirements: Java, Spring Boot", jd.getContent());
        assertEquals("Tech Corp", jd.getCompanyName());
    }

    @Test
    @DisplayName("InterviewSessions - Builder and JSONB Mapping Test")
    void testInterviewSessionsBuilder() {
        UUID galleryId = UUID.randomUUID();
        UUID cvId = UUID.randomUUID();
        UUID jdId = UUID.randomUUID();
        Map<String, Object> snapshot = Map.of("cv_text", "...", "jd_text", "...");
        Map<String, Object> feedback = Map.of("q1", "Good", "q2", "Poor");

        InterviewSessions session = InterviewSessions.builder()
                .galleryId(galleryId)
                .cvRefId(cvId)
                .jdRefId(jdId)
                .interviewType(InterviewType.TECHNICAL)
                .durationMinutes(45)
                .candidateExperienceLevel("Junior")
                .contextSnapshot(snapshot)
                .feedbackJson(feedback)
                .build();

        assertNotNull(session);
        assertEquals(galleryId, session.getGalleryId());
        assertEquals(cvId, session.getCvRefId());
        assertEquals(jdId, session.getJdRefId());
        assertEquals(InterviewType.TECHNICAL, session.getInterviewType());
        assertEquals(45, session.getDurationMinutes());
        assertEquals(snapshot, session.getContextSnapshot());
        assertEquals(feedback, session.getFeedbackJson());
    }

    @Test
    @DisplayName("InterviewAnswers - Builder Default Value Test")
    void testInterviewAnswersBuilder() {
        UUID sessionId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();
        InterviewAnswers answer = InterviewAnswers.builder()
                .sessionId(sessionId)
                .questionId(questionId)
                .answerText("My answer")
                .build();

        assertNotNull(answer);
        assertEquals(sessionId, answer.getSessionId());
        assertEquals(questionId, answer.getQuestionId());
        assertEquals("My answer", answer.getAnswerText());

        // Verify @Builder.Default
        assertFalse(answer.getIsSkipped(), "isSkipped should default to false");
    }

    @Test
    @DisplayName("CVTemplates - Builder Test")
    void testCVTemplatesBuilder() {
        CVTemplates template = CVTemplates.builder()
                .name("Modern Template")
                .category("Modern")
                .previewImage("http://image.url")
                .build();

        assertNotNull(template);
        assertEquals("Modern Template", template.getName());
        assertEquals("Modern", template.getCategory());
        assertEquals("http://image.url", template.getPreviewImage());
    }

    @Test
    @DisplayName("TemplateFeedback - Builder Test")
    void testTemplateFeedbackBuilder() {
        UUID accountId = UUID.randomUUID();
        TemplateFeedback feedback = TemplateFeedback.builder()
                .templateId("T1")
                .accountId(accountId)
                .rating(5)
                .comment("Excellent!")
                .build();

        assertNotNull(feedback);
        assertEquals("T1", feedback.getTemplateId());
        assertEquals(accountId, feedback.getAccountId());
        assertEquals(5, feedback.getRating());
        assertEquals("Excellent!", feedback.getComment());
    }

    @Test
    @DisplayName("CVFeedback - JSONB Mapping Test")
    void testCVFeedbackBuilder() {
        UUID cvId = UUID.randomUUID();
        UUID jdId = UUID.randomUUID();
        Map<String, Object> feedbackJson = Map.of("swot", Map.of("strengths", List.of("Java")));

        CVFeedback feedback = CVFeedback.builder()
                .cvId(cvId)
                .jdId(jdId)
                .overallScore(85)
                .feedbackJson(feedbackJson)
                .build();

        assertNotNull(feedback);
        assertEquals(cvId, feedback.getCvId());
        assertEquals(jdId, feedback.getJdId());
        assertEquals(85, feedback.getOverallScore());
        assertEquals(feedbackJson, feedback.getFeedbackJson());
    }

    @Test
    @DisplayName("CVOptimizationLogs - Builder Default Value Test")
    void testCVOptimizationLogsBuilder() {
        UUID cvId = UUID.randomUUID();
        CVOptimizationLogs log = CVOptimizationLogs.builder()
                .cvId(cvId)
                .sectionName("Experience")
                .originalText("I worked at X")
                .suggestedText("Accomplished X as measured by Y")
                .build();

        assertNotNull(log);
        assertEquals(cvId, log.getCvId());
        assertEquals("Experience", log.getSectionName());

        // Verify @Builder.Default
        assertFalse(log.getIsAccepted(), "isAccepted should default to false");
    }

    @Test
    @DisplayName("BaseEntity - Inheritance Test")
    void testBaseEntityInheritance() {
        Gallery gallery = Gallery.builder().accountId(UUID.randomUUID()).build();

        // Check if it has BaseEntity fields
        assertNotNull(gallery.getId(), "ID should be generated by BaseEntity");
        assertNotNull(gallery.getCreatedAt(), "CreatedAt should be set by BaseEntity");
        assertNotNull(gallery.getUpdatedAt(), "UpdatedAt should be set by BaseEntity");
    }

    @Test
    @DisplayName("Negative Case - Null values on Required Fields (Simulated)")
    void testNullRequiredFields() {
        // Since these are POJOs in unit tests, they won't throw exceptions until saved to DB.
        // But we can verify the builder allows nulls (which is correct for the POJO stage).
        CVs cv = CVs.builder().build();
        assertNull(cv.getName(), "Name should be null if not provided in builder");
        assertNull(cv.getContent(), "Content should be null if not provided in builder");
    }
}
