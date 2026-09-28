package fpt.su26.exe101.backend.modules.cv.repository;

import fpt.su26.exe101.backend.modules.cv.entity.CV;
import fpt.su26.exe101.backend.modules.cv.entity.CVFeedback;
import fpt.su26.exe101.backend.modules.cv.entity.CVTemplate;
import fpt.su26.exe101.backend.modules.cv.entity.TemplateFeedback;
import fpt.su26.exe101.backend.modules.cv.repository.CVFeedbackRepository;
import fpt.su26.exe101.backend.modules.cv.repository.CVRepository;
import fpt.su26.exe101.backend.modules.cv.repository.CVTemplateRepository;
import fpt.su26.exe101.backend.modules.cv.repository.TemplateFeedbackRepository;
import fpt.su26.exe101.backend.modules.gallery.entity.*;
import fpt.su26.exe101.backend.modules.gallery.repository.GalleryRepository;
import fpt.su26.exe101.backend.modules.gallery.repository.JobDescriptionRepository;
import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.dto.CVFeedbackContent;
import fpt.su26.exe101.backend.modules.cv.dto.SWOTAnalysis;
import fpt.su26.exe101.backend.modules.cv.dto.SectionFeedback;
import fpt.su26.exe101.backend.modules.cv.entity.enums.SkillLevel;
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
public class CVRepositoryIntegrationTest {

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

        CVContent content = CVContent.builder()
                .personalInfo(CVContent.PersonalInfo.builder()
                        .name("John Doe")
                        .email("john.doe@example.com")
                        .build())
                .experiences(List.of(CVContent.Experience.builder()
                        .company("Example Company")
                        .role("Software Engineer")
                        .period("2021-2024")
                        .details(List.of("Built Java services"))
                        .build()))
                .skills(List.of(CVContent.Skill.builder()
                        .name("Java")
                        .level(SkillLevel.ADVANCED)
                        .category("backend")
                        .build()))
                .build();

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
                .content(CVContent.builder()
                        .personalInfo(CVContent.PersonalInfo.builder()
                                .name("Test Candidate")
                                .build())
                        .summary("Test CV summary")
                        .build())
                .build();
        cvRepository.save(cv);

        JobDescription jd = JobDescription.builder()
                .gallery(gallery)
                .title("Software Engineer")
                .content("Java, Spring Boot")
                .build();
        jdRepository.save(jd);

        CVFeedbackContent feedbackJson = CVFeedbackContent.builder()
                .swot(SWOTAnalysis.builder()
                        .strengths(List.of("Strong Java", "Experience with Spring"))
                        .weaknesses(List.of("Lack of Cloud experience"))
                        .opportunities(List.of("Add cloud projects"))
                        .threats(List.of())
                        .build())
                .sectionAnalysis(List.of(SectionFeedback.builder()
                        .sectionName("Experience")
                        .strengths(List.of("Includes project experience"))
                        .weaknesses(List.of())
                        .suggestions(List.of("Quantify impact"))
                        .build()))
                .build();

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
        assertThat(retrieved.get().getFeedbackJson().getSwot().getStrengths())
                .contains("Strong Java", "Experience with Spring");
        assertThat(retrieved.get().getFeedbackJson().getSectionAnalysis())
                .extracting(SectionFeedback::getSectionName)
                .containsExactly("Experience");
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
                .content(CVContent.builder()
                        .summary("Test CV")
                        .build())
                .build();

        // Then
        assertThrows(Exception.class, () -> {
            cvRepository.saveAndFlush(cv);
        });
    }
}
