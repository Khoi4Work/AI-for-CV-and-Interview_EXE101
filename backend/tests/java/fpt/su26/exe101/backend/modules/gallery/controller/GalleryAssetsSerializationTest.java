package fpt.su26.exe101.backend.modules.gallery.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.dto.request.CVCreateRequestDTO;
import fpt.su26.exe101.backend.modules.cv.dto.request.CVUpdateRequestDTO;
import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.modules.cv.entity.CV;
import fpt.su26.exe101.backend.modules.cv.entity.CVTemplate;
import fpt.su26.exe101.backend.modules.cv.mapper.CVMapper;
import fpt.su26.exe101.backend.modules.cv.mapper.CVFeedbackMapper;
import fpt.su26.exe101.backend.modules.cv.repository.CVRepository;
import fpt.su26.exe101.backend.modules.cv.repository.CVTemplateRepository;
import fpt.su26.exe101.backend.modules.cv.service.CVPipelineService;
import fpt.su26.exe101.backend.modules.cv.service.AIProviderService;
import fpt.su26.exe101.backend.modules.cv.service.impl.CVPipelineServiceImpl;
import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;
import fpt.su26.exe101.backend.modules.gallery.repository.GalleryRepository;
import fpt.su26.exe101.backend.modules.gallery.service.GalleryService;
import fpt.su26.exe101.backend.modules.interview.service.InterviewService;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import org.hibernate.proxy.HibernateProxy;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfigurationPackage;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.*;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.*;
import org.springframework.transaction.support.TransactionTemplate;
import java.util.List;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DataJpaTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:gallery_assets_serialization;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
    "spring.datasource.username=sa", "spring.datasource.password=",
    "spring.datasource.driver-class-name=org.h2.Driver", "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect", "spring.jpa.show-sql=false"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ContextConfiguration(classes = GalleryAssetsSerializationTest.Config.class)
@Import(CVPipelineServiceImpl.class)
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class GalleryAssetsSerializationTest {
    @Configuration @AutoConfigurationPackage
    @EntityScan("fpt.su26.exe101.backend.modules")
    @EnableJpaRepositories(basePackageClasses = {CVRepository.class, GalleryRepository.class})
    static class Config {
        @Bean CVMapper cvMapper() { return Mappers.getMapper(CVMapper.class); }
    }
    @Autowired CVRepository cvs;
    @Autowired GalleryRepository galleries;
    @Autowired CVTemplateRepository templates;
    @Autowired CVMapper mapper;
    @Autowired CVPipelineService pipeline;
    @Autowired PlatformTransactionManager transactions;
    @MockBean GalleryService galleryService;
    @MockBean UsageQuotaService quotaService;
    @MockBean fpt.su26.exe101.backend.modules.cv.service.CVAnalysisQuotaService analysisQuotaService;
    @MockBean AIProviderService aiProvider;
    @MockBean CVFeedbackMapper feedbackMapper;

    @Test void linkedTemplateReturns200AndPlainJsonAfterServiceTransactionEnds() throws Exception {
        CV cv = fixture(true);
        CV other = fixture(true);
        when(galleryService.getCurrentGallery()).thenReturn(cv.getGallery());
        when(galleryService.getJobDescriptionsForCurrentGallery()).thenReturn(List.of());
        var mvc = MockMvcBuilders.standaloneSetup(new GalleryController(galleryService,
                mock(InterviewService.class), pipeline)).build();
        mvc.perform(get("/api/gallery/assets"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.result.cvs.length()").value(1))
            .andExpect(jsonPath("$.result.cvs[0].id").value(cv.getId().toString()))
            .andExpect(jsonPath("$.result.cvs[0].galleryId").value(cv.getGallery().getId().toString()))
            .andExpect(jsonPath("$.result.cvs[0].template.id").value(cv.getTemplate().getId()))
            .andExpect(jsonPath("$.result.cvs[0].template.name").value("Modern template"))
            .andExpect(jsonPath("$.result.cvs[0].template.hibernateLazyInitializer").doesNotExist())
            .andExpect(jsonPath("$.result.cvs[0].gallery").doesNotExist());
        assertNotEquals(cv.getGallery().getId(), other.getGallery().getId());
    }

    @Test void cvWithoutTemplateStillReturns200() throws Exception {
        CV cv = fixture(false);
        when(galleryService.getCurrentGallery()).thenReturn(cv.getGallery());
        when(galleryService.getJobDescriptionsForCurrentGallery()).thenReturn(List.of());
        var mvc = MockMvcBuilders.standaloneSetup(new GalleryController(galleryService,
                mock(InterviewService.class), pipeline)).build();
        mvc.perform(get("/api/gallery/assets"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.result.cvs[0].id").value(cv.getId().toString()))
            .andExpect(jsonPath("$.result.cvs[0].template").doesNotExist());
    }

    @Test void mapperConvertsRealLazyProxyToSerializableDto() throws Exception {
        CV cv = fixture(true);
        var dto = new TransactionTemplate(transactions).execute(tx -> {
            CV loaded = cvs.findById(cv.getId()).orElseThrow();
            assertInstanceOf(HibernateProxy.class, loaded.getTemplate());
            return mapper.cvToCVResponse(loaded);
        });
        String json = new ObjectMapper().findAndRegisterModules().writeValueAsString(dto);
        assertTrue(json.contains("Modern template"));
        assertFalse(json.contains("hibernateLazyInitializer"));
        assertFalse(json.contains("ByteBuddyInterceptor"));
    }

    @Test void editorCreateAndUpdatePersistTemplatePhotoAndTitleWithoutChargingUpdate() {
        CV fixture = fixture(true);
        Gallery gallery = fixture.getGallery();
        String templateId = fixture.getTemplate().getId();
        when(quotaService.getCvPlan(gallery.getAccountId())).thenReturn(UserPlan.ENHANCE);
        CVContent content = CVContent.builder().summary("Before")
                .profilePhoto("data:image/jpeg;base64,AA").professionalTitle("Frontend Developer")
                .selectedTemplateId(templateId).build();
        var created = pipeline.createCV(CVCreateRequestDTO.builder().name("Saved draft")
                .templateId(templateId).content(content).build(), gallery);
        content.setSummary("After");
        pipeline.updateCV(created.getId(), CVUpdateRequestDTO.builder().name("Updated draft")
                .templateId(templateId).content(content).build(), gallery);
        var restored = pipeline.getCVsForGallery(gallery).stream()
                .filter(cv -> cv.getId().equals(created.getId())).findFirst().orElseThrow();
        assertEquals("Updated draft", restored.getName());
        assertEquals(templateId, restored.getTemplate().getId());
        assertEquals(templateId, restored.getContent().getSelectedTemplateId());
        assertEquals("After", restored.getContent().getSummary());
        assertEquals("data:image/jpeg;base64,AA", restored.getContent().getProfilePhoto());
        assertEquals("Frontend Developer", restored.getContent().getProfessionalTitle());
        verify(quotaService, times(1)).consumeCvCreation(gallery.getAccountId());
    }

    private CV fixture(boolean linked) {
        return new TransactionTemplate(transactions).execute(tx -> {
            Gallery gallery = galleries.save(Gallery.builder().accountId(UUID.randomUUID()).build());
            CVTemplate template = linked ? templates.save(CVTemplate.builder().id(UUID.randomUUID().toString())
                    .name("Modern template").downloads(0).createdAt(java.time.LocalDateTime.now())
                    .updatedAt(java.time.LocalDateTime.now()).build()) : null;
            return cvs.saveAndFlush(CV.builder().gallery(gallery).template(template).name("Developer")
                    .content(CVContent.builder().summary("Sample CV").build()).build());
        });
    }
}
