package fpt.su26.exe101.backend.modules.cv.dto.response;

import java.util.UUID;

public record CVAlternativeRecommendationItemDTO(
        UUID analysisId,
        UUID jdId,
        String title,
        String companyName,
        String source,
        int score,
        String reason) {
}
