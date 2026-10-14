package fpt.su26.exe101.backend.modules.cv.service.impl;
import fpt.su26.exe101.backend.modules.cv.exception.CVAnalysisValidationException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.su26.exe101.backend.base.service.AIChatCompletionService;
import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.*;
import fpt.su26.exe101.backend.modules.cv.entity.enums.*;
import fpt.su26.exe101.backend.modules.gallery.service.JobDescriptionNormalizationService;
import fpt.su26.exe101.backend.modules.gallery.dto.JobDescriptionRequirementsResultDTO;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescriptionNormalizationMetadata;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescriptionNormalizationMetadata.JdEvidence;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescriptionNormalizationMetadata.Requirement;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
class CVEvidenceServiceTest {
    private Snapshot input(){return new Snapshot(UUID.randomUUID(),UUID.randomUUID(),"CV","Backend",null,"USER",null,null,"UNVERIFIED",CVContent.builder().build(),"Built Java APIs","Java is required",Set.of("BACKEND"),false);}
    private CVEvidenceServiceImpl service(AIChatCompletionService ai, Snapshot s) {
        var normalization=mock(JobDescriptionNormalizationService.class);
        var r = new Requirement(
                "r1", RequirementGroup.SKILLS, "Java is required", true,
                new JdEvidence("jd", "Java is required"));
        when(normalization.requirements(s.jdId(), s.jdTitle(), s.jdText()))
                .thenReturn(new JobDescriptionRequirementsResultDTO(
                        new JobDescriptionNormalizationMetadata(
                                Set.of("BACKEND"), "READY", null, null, "UNVERIFIED", null, List.of(r)),
                        0));
        return new CVEvidenceServiceImpl(ai,new ObjectMapper(),new CVEvidenceValidationServiceImpl(),normalization);
    }
    private String output(String quote, boolean mandatory) throws Exception {
        return new ObjectMapper().writeValueAsString(new Extraction(List.of(new Evidence("r1",RequirementGroup.SKILLS,"Java is required",mandatory,new Quote("jd","Java is required"),List.of(new Quote("cv",quote)),RequirementAssessment.MET,"Có minh chứng Java",""))));
    }
    @Test void hallucinatedQuoteGetsOneRepairAndProviderMetadataIsRecorded() throws Exception {
        var ai=mock(AIChatCompletionService.class);var s=input();
        when(ai.generateJsonWithMetadata(anyString(),isNull(),anyInt(),eq("cv"),eq("evidence-extraction")))
            .thenReturn(new AIChatCompletionService.Completion(output("5 years Java",true),"fake-primary","model-a",1),new AIChatCompletionService.Completion(output("Built Java APIs",true),"fake-fallback","model-b",2));
        var result=service(ai,s).extract(s);
        assertEquals(3,result.calls());assertEquals("fake-fallback",result.provider());assertEquals("model-b",result.model());
        verify(ai,times(2)).generateJsonWithMetadata(anyString(),isNull(),anyInt(),eq("cv"),eq("evidence-extraction"));
    }
    @Test void alteredRequirementWeightAndRepeatedMalformedOutputNeverProduceScore() throws Exception {
        var ai=mock(AIChatCompletionService.class);var s=input();
        when(ai.generateJsonWithMetadata(anyString(),isNull(),anyInt(),eq("cv"),eq("evidence-extraction")))
            .thenReturn(new AIChatCompletionService.Completion(output("Built Java APIs",false),"fake","model",1));
        assertThrows(CVAnalysisValidationException.class,()->service(ai,s).extract(s));
        verify(ai,times(2)).generateJsonWithMetadata(anyString(),isNull(),anyInt(),eq("cv"),eq("evidence-extraction"));
    }
}
