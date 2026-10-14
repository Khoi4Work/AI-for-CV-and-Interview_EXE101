package fpt.su26.exe101.backend.modules.interview.service.impl;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescription;
import fpt.su26.exe101.backend.modules.interview.entity.*;
import fpt.su26.exe101.backend.modules.interview.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import java.time.LocalDate;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class CompanyContextServiceTest {
    @Test void cultureNeedsActualSourceDateAndVerification() {
        var companies=mock(CompanyInfoRepository.class);
        var service=new CompanyContextServiceImpl(companies);ReflectionTestUtils.setField(service,"schemaEnabled",true);
        var jd=JobDescription.builder().companyName("FPT Telecom").build();
        var company=CompanyInfo.builder().companyName("FPT Telecom").cultureDescription("Reviewed culture context").build();company.setId(UUID.randomUUID());
        when(companies.findFirstByCompanyNameIgnoreCase("FPT Telecom")).thenReturn(Optional.of(company));
        assertFalse(service.resolve(jd).verified());assertEquals("",service.resolve(jd).culture());
        company.setCultureVerified(true);company.setCultureSourceUrl("https://example.com/reviewed-source");company.setCultureReferenceDate(LocalDate.of(2026,10,9));
        assertTrue(service.resolve(jd).verified());assertEquals("FPT Telecom",service.resolve(jd).companyName());
        company.setCultureReferenceDate(null);assertFalse(service.resolve(jd).verified());
    }
}
