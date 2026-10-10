package fpt.su26.exe101.backend.modules.cv.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.dto.request.*;
import fpt.su26.exe101.backend.modules.cv.entity.*;
import fpt.su26.exe101.backend.modules.cv.entity.enums.TemplateAccessLevel;
import fpt.su26.exe101.backend.modules.cv.mapper.*;
import fpt.su26.exe101.backend.modules.cv.repository.*;
import fpt.su26.exe101.backend.modules.cv.policy.TemplateAccessPolicy;
import fpt.su26.exe101.backend.modules.cv.service.*;
import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;
import fpt.su26.exe101.backend.modules.gallery.service.GalleryService;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CVEditorSaveTest {
    @Mock CVRepository cvs;
    @Mock CVTemplateRepository templates;
    @Mock CVFeedbackRepository feedback;
    @Mock CVOptimizationLogRepository logs;
    @Mock CVOptimizationJobRepository jobs;
    @Mock GalleryService galleries;
    @Mock UsageQuotaService quota;
    @Mock AIProviderService ai;
    @Mock CVMapper mapper;
    @Mock CVFeedbackMapper feedbackMapper;
    @Mock ObjectProvider<CVPipelineServiceImpl> self;
    @InjectMocks CVPipelineServiceImpl service;

    private Gallery gallery() {
        Gallery gallery = Gallery.builder().accountId(UUID.randomUUID()).build();
        gallery.setId(UUID.randomUUID());
        return gallery;
    }
    private CVContent content(String templateId) {
        return CVContent.builder().selectedTemplateId(templateId).profilePhoto("data:image/jpeg;base64,AA")
                .professionalTitle("Developer").summary("Summary").build();
    }
    @Test void planMatrixMatchesCatalogAndPersistence() {
        for (UserPlan plan : UserPlan.values()) for (TemplateAccessLevel level : TemplateAccessLevel.values()) {
            assertEquals(plan.ordinal() >= level.ordinal(), TemplateAccessPolicy.canUse(plan, level));
        }
        assertTrue(TemplateAccessPolicy.canUse(null, null));
        assertFalse(TemplateAccessPolicy.canUse(null, TemplateAccessLevel.MIDDLE));
    }
    @Test void forbiddenTemplateDoesNotConsumeQuotaOrWrite() {
        Gallery gallery = gallery();
        when(templates.findById("paid")).thenReturn(Optional.of(CVTemplate.builder().id("paid").minimumPlan(TemplateAccessLevel.MIDDLE).build()));
        when(quota.getCvPlan(gallery.getAccountId())).thenReturn(UserPlan.FREE);
        assertThrows(ApiException.class, () -> service.createCV(CVCreateRequestDTO.builder()
                .name("CV").content(content("paid")).templateId("paid").build(), gallery));
        verify(quota, never()).consumeCvCreation(any());
        verify(cvs, never()).save(any());
    }
    @Test void newDraftStoresForeignKeyAndCanonicalContentBeforeChargingOnce() {
        Gallery gallery = gallery();
        when(quota.consumeCvCreation(gallery.getAccountId())).thenReturn(new UsageQuotaService.CvCreationQuota(UserPlan.FREE,1,1));
        CVTemplate template = CVTemplate.builder().id("free").minimumPlan(TemplateAccessLevel.FREE).build();
        when(templates.findById("free")).thenReturn(Optional.of(template));
        when(quota.getCvPlan(gallery.getAccountId())).thenReturn(UserPlan.FREE);
        service.createCV(CVCreateRequestDTO.builder().name(" CV ").templateId("free").content(content(null)).build(), gallery);
        ArgumentCaptor<CV> saved = ArgumentCaptor.forClass(CV.class);
        verify(cvs).save(saved.capture());
        verify(quota).consumeCvCreation(gallery.getAccountId());
        assertSame(template, saved.getValue().getTemplate());
        assertEquals("free", saved.getValue().getContent().getSelectedTemplateId());
        assertEquals("CV", saved.getValue().getName());
    }
    @Test void ownerUpdateChangesTemplateWithoutConsumingCreationQuota() {
        Gallery gallery = gallery();
        UUID id = UUID.randomUUID();
        CV existing = CV.builder().name("old").gallery(gallery).content(content("paid")).build();
        CVTemplate free = CVTemplate.builder().id("free").minimumPlan(TemplateAccessLevel.FREE).build();
        when(cvs.findById(id)).thenReturn(Optional.of(existing));
        when(templates.findById("free")).thenReturn(Optional.of(free));
        when(quota.getCvPlan(gallery.getAccountId())).thenReturn(UserPlan.FREE);
        service.updateCV(id, CVUpdateRequestDTO.builder().name("new").content(content("free")).templateId("free").build(), gallery);
        assertSame(free, existing.getTemplate());
        assertEquals("new", existing.getName());
        verify(quota, never()).consumeCvCreation(any());
    }
    @Test void foreignOwnerCannotOverwriteCV() {
        UUID id = UUID.randomUUID();
        when(cvs.findById(id)).thenReturn(Optional.of(CV.builder().gallery(gallery()).name("other").build()));
        assertThrows(ApiException.class, () -> service.updateCV(id, CVUpdateRequestDTO.builder()
                .name("attack").content(content("free")).build(), gallery()));
        verify(cvs, never()).save(any());
        verifyNoInteractions(templates, quota);
    }
    @Test void expiredPaidTemplateCannotBeRetainedThroughAnUpdateWithoutTemplateId() {
        Gallery gallery = gallery();
        UUID id = UUID.randomUUID();
        CVTemplate paid = CVTemplate.builder().id("paid").minimumPlan(TemplateAccessLevel.ENHANCE).build();
        CV existing = CV.builder().gallery(gallery).name("old").template(paid).content(content("paid")).build();
        when(cvs.findById(id)).thenReturn(Optional.of(existing));
        when(templates.findById("paid")).thenReturn(Optional.of(paid));
        when(quota.getCvPlan(gallery.getAccountId())).thenReturn(UserPlan.FREE);
        assertThrows(ApiException.class, () -> service.updateCV(id, CVUpdateRequestDTO.builder()
                .name("new").content(content(null)).build(), gallery));
        assertEquals("old", existing.getName());
        verify(cvs, never()).save(any());
    }
    @Test void missingTemplateFailsBeforeQuotaAndLegacyDraftWithoutTemplateStillWorks() {
        Gallery gallery = gallery();
        when(templates.findById("missing")).thenReturn(Optional.empty());
        assertThrows(ApiException.class, () -> service.createCV(CVCreateRequestDTO.builder()
                .name("CV").content(content("missing")).build(), gallery));
        verify(quota, never()).consumeCvCreation(any());
        when(quota.consumeCvCreation(gallery.getAccountId())).thenReturn(new UsageQuotaService.CvCreationQuota(UserPlan.FREE,1,1));
        service.createCV(CVCreateRequestDTO.builder().name("Imported").content(content(null)).build(), gallery);
        verify(quota).consumeCvCreation(gallery.getAccountId());
        verify(cvs).save(any());
    }
    @Test void inconsistentIdsAndInvalidNamesFailBeforeQuota() {
        Gallery gallery = gallery();
        assertThrows(ApiException.class, () -> service.createCV(CVCreateRequestDTO.builder()
                .name("CV").templateId("free").content(content("paid")).build(), gallery));
        assertThrows(ApiException.class, () -> service.createCV(CVCreateRequestDTO.builder()
                .name(" ").content(content("free")).build(), gallery));
        verifyNoInteractions(cvs, templates, quota);
    }
    @Test void photoAndProfessionalTitleRoundTripInJsonContent() throws Exception {
        ObjectMapper json = new ObjectMapper();
        CVContent original = content("free");
        CVContent restored = json.readValue(json.writeValueAsString(original), CVContent.class);
        assertEquals(original, restored);
    }
    @Test void cosmeticSavePreservesImportEvidenceButContentEditInvalidatesIt() {
        Gallery gallery=gallery();UUID id=UUID.randomUUID();
        CVContent imported=content(null);
        imported.setSourceText("Original extracted CV text");
        imported.setSourceTruncated(false);imported.setTargetRoleOrigin("NONE");
        CV existing=CV.builder().gallery(gallery).name("CV").content(imported).build();
        when(cvs.findById(id)).thenReturn(Optional.of(existing));
        CVContent cosmetic=content(null);cosmetic.setProfilePhoto("new photo");
        service.updateCV(id,CVUpdateRequestDTO.builder().name("CV").content(cosmetic).build(),gallery);
        assertEquals("Original extracted CV text",existing.getContent().getSourceText());
        assertEquals("NONE",existing.getContent().getTargetRoleOrigin());
        CVContent edited=content(null);edited.setSummary("New real project evidence");
        service.updateCV(id,CVUpdateRequestDTO.builder().name("CV").content(edited).build(),gallery);
        assertNull(existing.getContent().getSourceText());
        assertEquals("EXPLICIT",existing.getContent().getTargetRoleOrigin());
        verify(quota,never()).consumeCvCreation(any());
    }
}
