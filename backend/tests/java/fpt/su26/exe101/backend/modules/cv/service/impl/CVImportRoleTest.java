package fpt.su26.exe101.backend.modules.cv.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.su26.exe101.backend.base.service.AIChatCompletionService;
import org.junit.jupiter.api.Test;
import java.nio.charset.StandardCharsets;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
class CVImportRoleTest {
    private fpt.su26.exe101.backend.modules.cv.dto.CVContent parse(String source,String title,String quote) {
        var ai=mock(AIChatCompletionService.class);
        when(ai.generateJson(anyString(),isNull(),anyInt(),eq("cv"),eq("cv-import"))).thenReturn(
            "{\"isCV\":true,\"extractedData\":{\"professionalTitle\":\""+title+"\",\"targetRoleOrigin\":\"EXPLICIT\",\"targetRoleEvidence\":\""+quote+"\"}}");
        return new AIProviderServiceImpl(
                ai,
                new RoleTaxonomyServiceImpl(new ObjectMapper()),
                new ObjectMapper())
                .parseCVFile(source.getBytes(StandardCharsets.UTF_8), "text/plain")
                .getExtractedData();
    }
    @Test void declaredRolePreservesQuoteAndParserText() {
        String source="Ứng tuyển: Business Analyst\nEmail: example@example.com";
        var cv=parse(source,"Business Analyst","Ứng tuyển: Business Analyst");
        assertEquals("BA",cv.getTargetRoleCode());assertEquals("EXPLICIT",cv.getTargetRoleOrigin());
        assertTrue(cv.getSourceText().contains("Business Analyst"));assertFalse(cv.getSourceTruncated());
    }
    @Test void historicalJobCannotBePromotedToTarget() {
        var cv=parse("Work experience\nBusiness Analyst at Previous Company 2020-2022","Business Analyst","Business Analyst at Previous Company 2020-2022");
        assertEquals("NONE",cv.getTargetRoleOrigin());assertEquals("",cv.getProfessionalTitle());
    }
    @Test void inventedQuoteIsRejectedConservatively() {
        var cv=parse("Email: example@example.com\nSQL and BPMN projects","Business Analyst","Applying for Business Analyst");
        assertEquals("NONE",cv.getTargetRoleOrigin());assertNull(cv.getTargetRoleEvidence());
    }
}
