package fpt.su26.exe101.backend.modules.cv.dto.response;

import fpt.su26.exe101.backend.modules.cv.entity.enums.RequirementAssessment;
import fpt.su26.exe101.backend.modules.cv.entity.enums.RequirementGroup;
import java.util.List;

public record CVAnalysisEvidenceResponseDTO(
        String requirementId,
        RequirementGroup group,
        String description,
        boolean mandatory,
        CVAnalysisQuoteResponseDTO jdEvidence,
        List<CVAnalysisQuoteResponseDTO> cvEvidence,
        RequirementAssessment assessment,
        String reason,
        String suggestion) {
}
