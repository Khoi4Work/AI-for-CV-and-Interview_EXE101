package fpt.su26.exe101.backend.modules.cv.service.impl;
import fpt.su26.exe101.backend.modules.cv.exception.CVAnalysisValidationException;
import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.*;
import fpt.su26.exe101.backend.modules.cv.entity.enums.*;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
class CVEvidenceValidationTest {
    private final CVEvidenceValidationServiceImpl validator = new CVEvidenceValidationServiceImpl();
    private Snapshot input(boolean truncated) {
        return new Snapshot(null,null,"CV","JD",null,"USER",null,null,"UNVERIFIED",CVContent.builder().build(),
            "Built Java APIs", "Java experience is required",Set.of("BACKEND"),truncated);
    }
    private Evidence e(String cv, String jd, String anchor, RequirementAssessment status) {
        return new Evidence("r1",RequirementGroup.SKILLS,"Java",true,new Quote("jd",jd),
            cv==null?List.of():List.of(new Quote(anchor,cv)),status,"Lý do có căn cứ","Bổ sung nếu đã có kinh nghiệm");
    }
    @Test void validQuoteWithWhitespaceNormalizationPasses() {
        assertDoesNotThrow(()->validator.validate(input(false),new Extraction(List.of(e("Built  Java APIs","Java experience","cv",RequirementAssessment.MET)))));
    }
    @Test void inventedQuoteIsRejected() {
        assertThrows(CVAnalysisValidationException.class,()->validator.validate(input(false),new Extraction(List.of(e("5 years Java","Java experience","cv",RequirementAssessment.MET)))));
    }
    @Test void inventedRequirementAndPageAnchorAreRejected() {
        assertThrows(CVAnalysisValidationException.class,()->validator.validate(input(false),new Extraction(List.of(e("Built Java APIs","Kubernetes","cv",RequirementAssessment.MET)))));
        assertThrows(CVAnalysisValidationException.class,()->validator.validate(input(false),new Extraction(List.of(e("Built Java APIs","Java experience","page-3",RequirementAssessment.MET)))));
    }
    @Test void absentEvidenceAndTruncatedInputCannotBeCalledMet() {
        assertThrows(CVAnalysisValidationException.class,()->validator.validate(input(false),new Extraction(List.of(e(null,"Java experience","cv",RequirementAssessment.MET)))));
        assertThrows(CVAnalysisValidationException.class,()->validator.validate(input(true),new Extraction(List.of(e("Built Java APIs","Java experience","cv",RequirementAssessment.MET)))));
    }
    @Test void duplicateIdsAndUncertainFailValidation() {
        var e = e(null,"Java experience","cv",RequirementAssessment.NOT_EVIDENCED);
        assertThrows(CVAnalysisValidationException.class,()->validator.validate(input(false),new Extraction(List.of(e,e))));
        assertThrows(CVAnalysisValidationException.class,()->validator.validate(input(false),new Extraction(List.of(e(null,"Java experience","cv",RequirementAssessment.UNCERTAIN)))));
    }
}
