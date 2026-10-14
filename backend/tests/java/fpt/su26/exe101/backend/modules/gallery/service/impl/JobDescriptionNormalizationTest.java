package fpt.su26.exe101.backend.modules.gallery.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.su26.exe101.backend.base.service.AIChatCompletionService;
import fpt.su26.exe101.backend.base.service.AIChatCompletionService.Completion;
import fpt.su26.exe101.backend.modules.cv.entity.enums.RequirementGroup;
import fpt.su26.exe101.backend.modules.cv.exception.CVAnalysisValidationException;
import fpt.su26.exe101.backend.modules.cv.service.impl.CVAnalysisServiceImpl;
import fpt.su26.exe101.backend.modules.cv.service.impl.RoleTaxonomyServiceImpl;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescription;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescriptionNormalizationMetadata;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescriptionNormalizationMetadata.JdEvidence;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescriptionNormalizationMetadata.Requirement;
import fpt.su26.exe101.backend.modules.gallery.exception.JobDescriptionRequirementsPendingException;
import fpt.su26.exe101.backend.modules.gallery.repository.JobDescriptionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Consumer;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class JobDescriptionNormalizationTest {
    private final JobDescriptionRepository jobs=mock(JobDescriptionRepository.class);
    private final AIChatCompletionService ai=mock(AIChatCompletionService.class);
    private final TransactionTemplate tx=mock(TransactionTemplate.class);
    private final JobDescriptionNormalizationServiceImpl service=new JobDescriptionNormalizationServiceImpl(jobs,new RoleTaxonomyServiceImpl(new ObjectMapper()),new ObjectMapper(),ai,tx);
    private final UUID id=UUID.randomUUID();
    private final String title="Backend Developer",content="Java required for developing production REST APIs.";

    private JobDescription stored(List<Requirement> requirements) {
        var row=JobDescription.builder().title(title).content(content).build();row.setId(id);
        row.setNormalizationHash(CVAnalysisServiceImpl.hash(title+"|"+content));row.setNormalizationVersion("jd-extraction-v1");
        row.setNormalizationMetadata(new JobDescriptionNormalizationMetadata(Set.of("BACKEND"),"READY",null,null,"UNVERIFIED",null,requirements));
        when(jobs.lock(id)).thenReturn(Optional.of(row));
        when(tx.execute(any())).thenAnswer(invocation -> ((TransactionCallback<?>)invocation.getArgument(0)).doInTransaction(mock(TransactionStatus.class)));
        doAnswer(invocation -> {Consumer<TransactionStatus> callback=invocation.getArgument(0);callback.accept(mock(TransactionStatus.class));return null;}).when(tx).executeWithoutResult(any());
        return row;
    }
    @Test void genericTitleFindsActualRoleWithoutInventingVerifiedSource() {
        var jd=JobDescription.builder().title("User provided JD").content("{\"title\":\"Business Analyst\",\"source\":\"https://example.com/job\",\"requirements\":[\"Gather stakeholder requirements\"]}").build();jd.setId(id);
        var result=service.normalize(jd,null);
        assertEquals(Set.of("BA"),result.roleCodes());assertEquals("UNVERIFIED",result.verification());
        assertEquals("https://example.com/job",result.sourceUrl());verifyNoInteractions(ai,jobs);
    }
    @Test void cachedRequirementsUseNoModelCalls() {
        stored(List.of(new Requirement("r1",RequirementGroup.SKILLS,"Java required",true,new JdEvidence("jd","Java required"))));
        assertEquals(0,service.requirements(id,title,content).calls());verifyNoInteractions(ai);
    }
    @Test void activeExtractionLeaseQueuesOtherCallerWithoutAnotherModelCall() {
        var row=stored(List.of());row.setExtractionStatus("PROCESSING");row.setExtractionLeaseUntil(LocalDateTime.now().plusMinutes(1));
        assertThrows(JobDescriptionRequirementsPendingException.class,()->service.requirements(id,title,content));
        verifyNoInteractions(ai);
    }
    @Test void inventedRequirementGetsOneRepairThenTypedEvidenceFailure() {
        var row=stored(List.of());
        when(ai.generateJsonWithMetadata(anyString(),isNull(),anyInt(),anyString(),anyString())).thenReturn(new Completion("{\"requirements\":[{\"requirementId\":\"r1\",\"group\":\"SKILLS\",\"description\":\"Kubernetes required\",\"mandatory\":true,\"jdEvidence\":{\"anchor\":\"jd\",\"text\":\"Kubernetes required\"}}]}","fake","fake",1));
        assertThrows(CVAnalysisValidationException.class,()->service.requirements(id,title,content));
        verify(ai,times(2)).generateJsonWithMetadata(anyString(),isNull(),anyInt(),anyString(),anyString());
        assertEquals("FAILED",row.getExtractionStatus());
    }

    private Completion validResponse() {
        return new Completion("{\"requirements\":[{\"requirementId\":\"r1\",\"group\":\"SKILLS\",\"description\":\"Java required\",\"mandatory\":true,\"jdEvidence\":{\"anchor\":\"jd\",\"text\":\"Java required\"}}]}","fake","fake",1);
    }
    @Test void successfulExtractionCachesOnOwnerRow() {
        var row=stored(List.of());
        when(ai.generateJsonWithMetadata(anyString(),isNull(),anyInt(),anyString(),anyString())).thenReturn(validResponse());
        assertEquals(1,service.requirements(id,title,content).calls());
        assertEquals("READY",row.getExtractionStatus());
        assertEquals(1,row.getNormalizationMetadata().requirements().size());
        assertEquals(0,service.requirements(id,title,content).calls());
        verify(ai,times(1)).generateJsonWithMetadata(anyString(),isNull(),anyInt(),anyString(),anyString());
    }
    @Test void lateExtractionCannotOverwriteEditedJd() {
        var row=stored(List.of());
        var edited=new JobDescriptionNormalizationMetadata(Set.of("BA"),"READY",null,null,"UNVERIFIED",null,List.of());
        when(ai.generateJsonWithMetadata(anyString(),isNull(),anyInt(),anyString(),anyString())).thenAnswer(call -> {
            row.setContent("Gather stakeholder requirements.");
            row.setNormalizationMetadata(edited);row.setNormalizationHash("edited");row.setExtractionStatus("IDLE");row.setExtractionClaimToken(null);
            return validResponse();
        });
        assertEquals(1,service.requirements(id,title,content).metadata().requirements().size());
        assertEquals(edited,row.getNormalizationMetadata());assertEquals("IDLE",row.getExtractionStatus());
    }
    @Test void oldSnapshotDoesNotClaimOrReplaceLiveJdCache() {
        var row=stored(List.of());row.setContent("Gather stakeholder requirements.");
        when(ai.generateJsonWithMetadata(anyString(),isNull(),anyInt(),anyString(),anyString())).thenReturn(validResponse());
        assertEquals(1,service.requirements(id,title,content).calls());
        assertEquals("IDLE",row.getExtractionStatus());
        assertEquals(List.of(),row.getNormalizationMetadata().requirements());
    }
}
