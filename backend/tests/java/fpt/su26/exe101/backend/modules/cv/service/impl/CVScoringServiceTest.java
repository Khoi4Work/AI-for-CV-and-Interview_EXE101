package fpt.su26.exe101.backend.modules.cv.service.impl;
import fpt.su26.exe101.backend.modules.cv.exception.CVAnalysisValidationException;

import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.*;
import fpt.su26.exe101.backend.modules.cv.entity.enums.*;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

class CVScoringServiceTest {
    private final CVScoringServiceImpl scorer = new CVScoringServiceImpl();
    private Snapshot snapshot(boolean clear) {
        CVContent cv = clear ? CVContent.builder().personalInfo(CVContent.PersonalInfo.builder().email("a@example.com").build())
            .skills(List.of(CVContent.Skill.builder().name("Java").build()))
            .projects(List.of(CVContent.Project.builder().name("API").details(List.of("Build Java API")).build())).build()
            : CVContent.builder().build();
        return new Snapshot(UUID.randomUUID(),UUID.randomUUID(),"CV","Backend","FPT","SYSTEM",null,null,"UNVERIFIED",cv,
            "Email: a@example.com\nProject: API\nBuild Java API", "Java required. API experience required.",Set.of("BACKEND"),false);
    }
    private Evidence e(String id, RequirementGroup group, boolean required, RequirementAssessment assessment) {
        return new Evidence(id,group,id,required,new Quote("jd","Java required"),List.of(),assessment,"reason","suggestion");
    }
    @Test void fullAttainmentIs100AndAbsentEducationIsNotDeducted() {
        var result = scorer.score(snapshot(true),new Extraction(List.of(e("java",RequirementGroup.SKILLS,true,RequirementAssessment.MET), e("api",RequirementGroup.EXPERIENCE,true,RequirementAssessment.MET))));
        assertEquals(100,result.score());
        assertFalse(result.breakdown().stream().anyMatch(g -> g.group()==RequirementGroup.EDUCATION));
    }
    @Test void noEvidenceAndNoClarityScoreZero() {
        var result = scorer.score(snapshot(false),new Extraction(List.of(e("java",RequirementGroup.SKILLS,true,RequirementAssessment.NOT_EVIDENCED))));
        assertEquals(0,result.score());
    }
    @Test void mandatoryWeightAndRoundingMatchHandCalculation() {
        // Skill attainment = (2*1 + 1*0.5)/3. All clarity met. (40*5/6 +15)/55*100 =87.878...
        var result = scorer.score(snapshot(true),new Extraction(List.of(e("java",RequirementGroup.SKILLS,true,RequirementAssessment.MET),e("sql",RequirementGroup.SKILLS,false,RequirementAssessment.PARTIAL))));
        assertEquals(88,result.score());
        assertEquals(88,result.contributions().stream().map(Contribution::points).reduce(java.math.BigDecimal.ZERO,java.math.BigDecimal::add).setScale(0,java.math.RoundingMode.HALF_UP).intValue());
    }
    @Test void uncertainCannotSilentlyBecomeZero() {
        assertThrows(CVAnalysisValidationException.class,()->scorer.score(snapshot(true),new Extraction(List.of(e("java",RequirementGroup.SKILLS,true,RequirementAssessment.UNCERTAIN)))));
    }
    @Test void rubricReplayIsDeterministic() {
        var s = snapshot(true); var extraction = new Extraction(List.of(e("java",RequirementGroup.SKILLS,true,RequirementAssessment.PARTIAL)));
        assertEquals(scorer.score(s,extraction),scorer.score(s,extraction));
    }
}
