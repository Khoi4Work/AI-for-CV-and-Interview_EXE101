package fpt.su26.exe101.backend.modules.cv.dto.response;

import java.math.BigDecimal;

public record CVAnalysisContributionResponseDTO(
        CVAnalysisEvidenceResponseDTO evidence,
        BigDecimal points) {
}
