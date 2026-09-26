package fpt.su26.exe101.backend.modules.gallery.repository;

import fpt.su26.exe101.backend.modules.gallery.entity.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class GalleryRepositoryIntegrationTest {

    @Autowired
    private GalleryRepository galleryRepository;

    @Autowired
    private CVRepository cvRepository;

    @Autowired
    private JobDescriptionRepository jdRepository;

    @Autowired
    private CVFeedbackRepository feedbackRepository;

    @Autowired
    private CVTemplateRepository templateRepository;

    @Autowired
    private TemplateFeedbackRepository templateFeedbackRepository;

    @Test
    void testCVAndTemplateRelationship() {
        // Given
        CVTemplate template = CVTemplate.builder()
                .name("Modern Professional")
                .build();
        templateRepository.save(template);

        Gallery gallery = Gallery.builder()
                .accountId(UUID.randomUUID())
                .build();
        galleryRepository.save(gallery);

        Map<String, Object> content = new HashMap<>();
        content.put("fullName", "John Doe");
        content.put("experience", "5 years");

        CV cv = CV.builder()
                .gallery(gallery)
                .template(template)
                .name("John Doe CV")
                .content(content)
                .build();
        cvRepository.save(cv);

        // When
        List<CV> cvsByTemplate = cvRepository.findByTemplateId(template.getId());

        // Then
        assertThat(cvsByTemplate).isNotEmpty();
        assertThat(cvsByTemplate.get(0).getName()).isEqualTo("John Doe CV");
        assertThat(cvsByTemplate.get(0).getContent()).isEqualTo(content);
    }

    @Test
    void testCVFeedbackJSONBMapping() {
        // Given
        Gallery gallery = Gallery.builder()
                .accountId(UUID.randomUUID())
                .build();
        galleryRepository.save(gallery);

        CV cv = CV.builder()
                .gallery(gallery)
                .name("Test CV")
                .content(Collections.singletonMap("key", "val"))
                .build();
        cvRepository.save(cv);

        JobDescription jd = JobDescription.builder()
                .gallery(gallery)
                .title("Software Engineer")
                .content("Java, Spring Boot")
                .build();
        jdRepository.save(jd);

        Map<String, Object> feedbackJson = new HashMap<>();
        Map<String, List<String>> swot = new HashMap<>();
        swot.put("strengths", Arrays.asList("Strong Java", "Experience with Spring"));
        swot.put("weaknesses", Arrays.asList("Lack of Cloud experience"));
        feedbackJson.put("swot", swot);
        feedbackJson.put("overallScore", 85);

        CVFeedback feedback = CVFeedback.builder()
                .cv(cv)
                .jobDescription(jd)
                .overallScore(85)
                .feedbackJson(feedbackJson)
                .build();
        feedbackRepository.save(feedback);

        // When
        Optional<CVFeedback> retrieved = feedbackRepository.findByCvIdAndJobDescriptionId(cv.getId(), jd.getId());

        // Then
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getFeedbackJson()).isEqualTo(feedbackJson);
        assertThat(((Map)retrieved.get().getFeedbackJson().get("swot")).get("strengths")).asList().contains("Strong Java");
    }

    @Test
    void testTemplateFeedbackRelationship() {
        // Given
        CVTemplate template = CVTemplate.builder()
                .name("Minimalist")
                .build();
        templateRepository.save(template);

        UUID accountId = UUID.randomUUID();
        TemplateFeedback feedback = TemplateFeedback.builder()
                .template(template)
                .accountId(accountId)
                .rating(5)
                .comment("Love it!")
                .build();
        templateFeedbackRepository.save(feedback);

        // When
        List<TemplateFeedback> byTemplate = templateFeedbackRepository.findByTemplateId(template.getId());
        List<TemplateFeedback> byAccount = templateFeedbackRepository.findByAccountId(accountId);

        // Then
        assertThat(byTemplate).hasSize(1);
        assertThat(byAccount).hasSize(1);
        assertThat(byTemplate.get(0).getComment()).isEqualTo("Love it!");
    }

    @Test
    void testNegativeCase_NotFound() {
        // When
        Optional<CVFeedback> result = feedbackRepository.findByCvIdAndJobDescriptionId(UUID.randomUUID(), UUID.randomUUID());

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void testConstraintViolation_MissingGallery() {
        // Given: CV cannot be created without a Gallery (nullable = false)
        CV cv = CV.builder()
                .name("Invalid CV")
                .content(Collections.singletonMap("k", "v"))
                .build();

        // Then
        assertThrows(Exception.class, () -> {
            cvRepository.saveAndFlush(cv);
        });
    }
}
