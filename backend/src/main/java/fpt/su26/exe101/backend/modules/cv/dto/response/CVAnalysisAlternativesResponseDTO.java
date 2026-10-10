package fpt.su26.exe101.backend.modules.cv.dto.response;

import java.util.List;
import java.util.UUID;

public record CVAnalysisAlternativesResponseDTO(
        UUID parentAnalysisId,
        String status,
        List<CVAlternativeRecommendationItemDTO> items,
        int evaluatedCount,
        int failedCount) {
}
