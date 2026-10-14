package fpt.su26.exe101.backend.modules.cv.dto.response;

import fpt.su26.exe101.backend.modules.cv.entity.enums.AnalysisStatus;
import java.time.LocalDateTime;
import java.util.UUID;

public record CVAnalysisResponseDTO(
        UUID analysisId,
        UUID cvId,
        UUID jdId,
        AnalysisStatus status,
        String phase,
        boolean reused,
        String rubricVersion,
        String extractionVersion,
        String taxonomyVersion,
        CVAnalysisSnapshotResponseDTO snapshot,
        CVAnalysisResultResponseDTO result,
        String error,
        LocalDateTime createdAt,
        String provider,
        String model,
        int modelCalls,
        Integer remaining) {
}
