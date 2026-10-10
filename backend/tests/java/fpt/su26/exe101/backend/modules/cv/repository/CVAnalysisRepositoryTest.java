package fpt.su26.exe101.backend.modules.cv.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.dto.request.CVAnalysisStartRequestDTO;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.*;
import fpt.su26.exe101.backend.modules.cv.entity.enums.*;
import fpt.su26.exe101.backend.modules.cv.entity.*;
import fpt.su26.exe101.backend.modules.cv.service.*;
import fpt.su26.exe101.backend.modules.cv.service.impl.*;
import fpt.su26.exe101.backend.modules.gallery.entity.*;
import fpt.su26.exe101.backend.modules.gallery.repository.*;
import fpt.su26.exe101.backend.modules.gallery.service.*;
import fpt.su26.exe101.backend.modules.gallery.entity.enums.JobDescriptionSource;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@DataJpaTest @ActiveProfiles("test") @AutoConfigureTestDatabase(replace=AutoConfigureTestDatabase.Replace.NONE)
@Import({CVAnalysisServiceImpl.class,CVAnalysisQuotaServiceImpl.class,RoleTaxonomyServiceImpl.class,CVScoringServiceImpl.class,CVAnalysisWorkerImpl.class,CVAnalysisRepositoryTest.Config.class})
class CVAnalysisRepositoryTest {
    @TestConfiguration static class Config {
        @Bean ObjectMapper objectMapper(){return new ObjectMapper();}
        @Bean TransactionTemplate transactionTemplate(PlatformTransactionManager manager){return new TransactionTemplate(manager);}
    }
    @Autowired CVAnalysisServiceImpl service;
    @Autowired CVAnalysisWorkerImpl worker;
    @Autowired CVAnalysisRepository analyses;
    @Autowired GalleryRepository galleries;
    @Autowired CVRepository cvs;
    @Autowired JobDescriptionRepository jds;
    @Autowired CVAlternativeRecommendationJobRepository alternativeJobs;
    @Autowired jakarta.persistence.EntityManager entityManager;
    @MockBean GalleryService galleryService;
    @MockBean JobDescriptionNormalizationService normalization;
    @MockBean CVEvidenceService evidence;
    private Gallery owner; private CV cv; private JobDescription jd;
    @BeforeEach void input() {
        ReflectionTestUtils.setField(service,"enabled",true);
        owner=galleries.saveAndFlush(Gallery.builder().accountId(UUID.randomUUID()).build());
        cv=cvs.saveAndFlush(CV.builder().gallery(owner).name("CV").aiAnalysisLimit(2).aiAnalysisRemaining(2)
            .content(CVContent.builder().skills(List.of(CVContent.Skill.builder().name("Java").build())).build()).build());
        jd=jds.saveAndFlush(JobDescription.builder().source(JobDescriptionSource.SYSTEM).title("Backend Developer")
            .content("Java experience is required. Build Java API services, maintain code, write tests and deliver backend projects with the development team.").build());
        when(normalization.normalize(any(),any())).thenAnswer(inv->{JobDescription job=inv.getArgument(0);return new JobDescriptionNormalizationMetadata(new RoleTaxonomyServiceImpl(new ObjectMapper()).jobRoles(job.getTitle(),job.getContent()),"READY",null,null,"UNVERIFIED",null,List.of());});
    }
    @Test void sameInputAndIdempotencyReserveOnceEvenWhenQuotaRunsOut() {
        var first=service.start(cv.getId(),new CVAnalysisStartRequestDTO(jd.getId(),null,null),"key-1",owner);
        var sameRequest=service.start(cv.getId(),new CVAnalysisStartRequestDTO(jd.getId(),null,null),"key-1",owner);
        cv.setAiAnalysisRemaining(0);cvs.flush();
        var sameInput=service.start(cv.getId(),new CVAnalysisStartRequestDTO(jd.getId(),null,null),"key-2",owner);
        assertEquals(first.analysisId(),sameRequest.analysisId());assertEquals(first.analysisId(),sameInput.analysisId());
        assertTrue(sameInput.reused());assertEquals(1,analyses.findAll().stream().filter(a->a.getQuotaStatus()!=AnalysisQuotaStatus.NOT_CHARGED).count());assertEquals(AnalysisQuotaStatus.RESERVED,analyses.findById(first.analysisId()).orElseThrow().getQuotaStatus());
        verifyNoInteractions(evidence);
    }
    @Test void conflictingKeyAndOtherOwnerCannotReadOrSelectPrivateJD() {
        var result=service.start(cv.getId(),new CVAnalysisStartRequestDTO(jd.getId(),null,null),"key",owner);
        assertThrows(ApiException.class,()->service.start(cv.getId(),new CVAnalysisStartRequestDTO(jd.getId(),"extra text",null),"other",owner));
        assertThrows(ApiException.class,()->service.start(cv.getId(),new CVAnalysisStartRequestDTO(null,jd.getContent()+" changed",null),"key",owner));
        Gallery other=galleries.saveAndFlush(Gallery.builder().accountId(UUID.randomUUID()).build());
        assertThrows(ApiException.class,()->service.read(result.analysisId(),other));
        JobDescription privateJD=jds.saveAndFlush(JobDescription.builder().gallery(other).title("BA").content(jd.getContent()).build());
        assertThrows(ApiException.class,()->service.start(cv.getId(),new CVAnalysisStartRequestDTO(privateJD.getId(),null,null),"private",owner));
    }
    @Test void workerFailureRefundsExactlyOnceAndNewKeyAllowsRetry() {
        var result=service.start(cv.getId(),new CVAnalysisStartRequestDTO(jd.getId(),null,null),"key",owner);
        when(evidence.extract(any())).thenThrow(new IllegalStateException("provider unavailable"));
        worker.process(result.analysisId());worker.process(result.analysisId());
        assertEquals(AnalysisStatus.FAILED,service.read(result.analysisId(),owner).status());
        assertEquals(2,cvs.findById(cv.getId()).orElseThrow().getAiAnalysisRemaining());
        assertEquals(AnalysisQuotaStatus.REFUNDED,analyses.findById(result.analysisId()).orElseThrow().getQuotaStatus());
        var retry=service.start(cv.getId(),new CVAnalysisStartRequestDTO(jd.getId(),null,null),"retry",owner);
        assertEquals(result.analysisId(),retry.analysisId());assertEquals(AnalysisStatus.PENDING,retry.status());
        assertEquals(1,cvs.findById(cv.getId()).orElseThrow().getAiAnalysisRemaining());
        verify(evidence,times(1)).extract(any());
    }
    @Test void completedSnapshotAndScoreSurviveJDChangesAndReadsDoNotCharge() {
        var result=service.start(cv.getId(),new CVAnalysisStartRequestDTO(jd.getId(),null,null),"key",owner);
        var e=new Evidence("java",RequirementGroup.SKILLS,"Java",true,new Quote("jd","Java experience is required"),List.of(),RequirementAssessment.NOT_EVIDENCED,"Chưa có minh chứng","Bổ sung kinh nghiệm thật");
        when(evidence.extract(any())).thenReturn(new CVEvidenceService.Output(new Extraction(List.of(e)),"FAKE","fixture",1));
        worker.process(result.analysisId());
        int score=service.read(result.analysisId(),owner).result().score();
        String original=jd.getContent();jd.setContent(original+" New requirement: SQL.");jd.setActive(false);jds.flush();
        entityManager.flush();entityManager.clear();
        var read=service.read(result.analysisId(),owner);
        assertEquals(original,read.snapshot().jdText());assertEquals(score,read.result().score());
        assertEquals(AnalysisQuotaStatus.CONSUMED,analyses.findById(result.analysisId()).orElseThrow().getQuotaStatus());
        assertEquals(1,cvs.findById(cv.getId()).orElseThrow().getAiAnalysisRemaining());verify(evidence,times(1)).extract(any());
    }
    @Test void cosmeticCVChangesKeepCacheAndEvidenceChangesCreateNewKey() {
        var first=service.start(cv.getId(),new CVAnalysisStartRequestDTO(jd.getId(),null,null),"first",owner);
        cv.setName("Renamed CV");cv.getContent().setProfilePhoto("photo");cv.getContent().setSelectedTemplateId("different");cvs.flush();
        var cosmetic=service.start(cv.getId(),new CVAnalysisStartRequestDTO(jd.getId(),null,null),"cosmetic",owner);assertEquals(first.analysisId(),cosmetic.analysisId());
        cv.getContent().setSummary("Built Java services for an actual project");cvs.flush();
        var edited=service.start(cv.getId(),new CVAnalysisStartRequestDTO(jd.getId(),null,null),"edited",owner);assertNotEquals(first.analysisId(),edited.analysisId());
    }
    @Test void alternativesUsePersistedBaselineExcludeSameRoleAndReuseCandidateAnalyses() {
        var baseline=service.start(cv.getId(),new CVAnalysisStartRequestDTO(jd.getId(),null,null),"baseline",owner);
        when(evidence.extract(any())).thenAnswer(inv->{Snapshot s=inv.getArgument(0);var e=new Evidence("r1",RequirementGroup.SKILLS,"Java",true,new Quote("jd","Java"),List.of(new Quote("cv","Java")),s.jdId().equals(jd.getId())?RequirementAssessment.PARTIAL:RequirementAssessment.MET,"Có căn cứ","Bổ sung mô tả");return new CVEvidenceService.Output(new Extraction(List.of(e)),"FAKE","fixture",1);});
        worker.process(baseline.analysisId());
        var ba=jds.saveAndFlush(JobDescription.builder().source(JobDescriptionSource.SYSTEM).title("Business Analyst")
            .content("Requirements: Java domain knowledge, stakeholder interviews, user stories, requirements elicitation, SQL and BPMN process modeling for enterprise projects.").build());
        jds.saveAndFlush(JobDescription.builder().source(JobDescriptionSource.SYSTEM).title("Senior Backend Developer").content(jd.getContent()+" Senior level.").build());
        jds.saveAndFlush(JobDescription.builder().source(JobDescriptionSource.SYSTEM).title("Business Analyst").content(ba.getContent()).active(false).build());
        var first=service.startAlternatives(baseline.analysisId(),owner);
        var job=alternativeJobs.findByAnalysisId(baseline.analysisId()).orElseThrow();
        assertEquals(List.of(ba.getId()),job.getCandidateIds());
        ReflectionTestUtils.invokeMethod(worker,"advanceAlternatives",job.getId());
        var child=analyses.findById(job.getAnalysisIds().getFirst()).orElseThrow();worker.process(child.getId());
        ReflectionTestUtils.invokeMethod(worker,"advanceAlternatives",job.getId());
        var ready=service.readAlternatives(baseline.analysisId(),owner);
        assertEquals("COMPLETED",ready.status());assertEquals(1,ready.items().size());
        assertTrue(ready.items().getFirst().score()>service.read(baseline.analysisId(),owner).result().score());
        assertEquals(child.getId(),ready.items().getFirst().analysisId());
        int remaining=cvs.findById(cv.getId()).orElseThrow().getAiAnalysisRemaining();
        service.startAlternatives(baseline.analysisId(),owner);service.read(child.getId(),owner);
        assertEquals(remaining,cvs.findById(cv.getId()).orElseThrow().getAiAnalysisRemaining());
        assertEquals(1,analyses.findAll().stream().filter(a->a.getQuotaStatus()!=AnalysisQuotaStatus.NOT_CHARGED).count());verify(evidence,times(2)).extract(any());
    }
}
