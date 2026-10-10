package fpt.su26.exe101.backend.modules.cv.dto.response;

import fpt.su26.exe101.backend.modules.cv.entity.enums.RequirementGroup;
import java.math.BigDecimal;

public record CVAnalysisBreakdownResponseDTO(
        RequirementGroup group,
        BigDecimal weight,
        BigDecimal attainment,
        BigDecimal points) {
}
