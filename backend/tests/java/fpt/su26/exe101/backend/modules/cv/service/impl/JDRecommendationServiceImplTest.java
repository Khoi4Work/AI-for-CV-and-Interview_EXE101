package fpt.su26.exe101.backend.modules.cv.service.impl;

import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.entity.CV;
import fpt.su26.exe101.backend.modules.cv.repository.CVRepository;
import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescription;
import fpt.su26.exe101.backend.modules.gallery.entity.enums.JobDescriptionSource;
import fpt.su26.exe101.backend.modules.gallery.repository.JobDescriptionRepository;
import fpt.su26.exe101.backend.modules.cv.service.AIProviderService;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JDRecommendationServiceImplTest {
    @Mock CVRepository cvRepository;
    @Mock JobDescriptionRepository jdRepository;
    @Mock AIProviderService aiProvider;
    @Mock UsageQuotaService quotaService;

    private JDRecommendationServiceImpl service;
    private Gallery gallery;
    private UUID cvId;

    @BeforeEach
    void setUp() {
        service = new JDRecommendationServiceImpl(cvRepository, jdRepository, aiProvider, quotaService, "", "test-model");
        gallery = Gallery.builder().accountId(UUID.randomUUID()).build();
        gallery.setId(UUID.randomUUID());
        cvId = UUID.randomUUID();
        when(jdRepository.findByGalleryId(gallery.getId())).thenReturn(List.of());
    }

    @Test
    void businessAnalystRoleFindsBusinessAnalystAndVietnameseAliases() {
        CV cv = cv(CVContent.builder().professionalTitle("Business Analyst").build());
        when(cvRepository.findWithGalleryById(cvId)).thenReturn(Optional.of(cv));
        when(jdRepository.findBySourceAndActiveTrue(JobDescriptionSource.SYSTEM)).thenReturn(List.of(
                jd("User Provided JD", "Vị trí tuyển dụng: Business Analyst. Requirements elicitation and stakeholder interviews."),
                jd("User Provided JD", "Vị trí: Chuyên viên Phân tích nghiệp vụ. Create user stories and process models."),
                jd("User Provided JD", "Vị trí tuyển dụng: Data Analyst. Build analytics dashboards with SQL.")
        ));

        var recommendations = service.recommend(cvId, gallery.getId());

        assertEquals(2, recommendations.size());
        assertTrue(recommendations.stream().allMatch(item ->
                item.getContent().toLowerCase().contains("business analyst")
                        || item.getContent().toLowerCase().contains("phân tích nghiệp vụ")));
    }

    @Test
    void missingExplicitRoleRanksJDsFromSkillsAndProjectsInsteadOfPastJobTitle() {
        CV cv = cv(CVContent.builder()
                .professionalTitle("")
                .experiences(List.of(CVContent.Experience.builder().role("Retail Manager").build()))
                .skills(List.of(
                        CVContent.Skill.builder().name("SQL").build(),
                        CVContent.Skill.builder().name("BPMN").build()))
                .projects(List.of(CVContent.Project.builder().details(List.of(
                        "Elicited requirements from stakeholders, wrote user stories, and created BPMN process models."
                )).build()))
                .build());
        when(cvRepository.findWithGalleryById(cvId)).thenReturn(Optional.of(cv));
        when(jdRepository.findBySourceAndActiveTrue(JobDescriptionSource.SYSTEM)).thenReturn(List.of(
                jd("Business Analyst", "Elicit requirements from stakeholders. Write user stories and BPMN process models. SQL preferred."),
                jd("Backend Developer", "Build Java Spring APIs, optimize services, and write unit tests.")
        ));

        var recommendations = service.recommend(cvId, gallery.getId());

        assertEquals(1, recommendations.size());
        assertEquals("Business Analyst", recommendations.getFirst().getTitle());
    }

    private CV cv(CVContent content) {
        return CV.builder().gallery(gallery).content(content).name("CV test").build();
    }

    private JobDescription jd(String title, String content) {
        return JobDescription.builder()
                .source(JobDescriptionSource.SYSTEM)
                .active(true)
                .title(title)
                .companyName("FPT")
                .industry("IT")
                .content(content)
                .build();
    }
}
