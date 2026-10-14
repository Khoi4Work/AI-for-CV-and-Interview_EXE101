package fpt.su26.exe101.backend.modules.cv.dto.response;

import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import java.util.Set;
import java.util.UUID;

public record CVAnalysisSnapshotResponseDTO(
        UUID cvId,
        UUID jdId,
        String cvName,
        String jdTitle,
        String companyName,
        String source,
        String sourceUrl,
        String referenceDate,
        String verification,
        CVContent cv,
        String cvText,
        String jdText,
        Set<String> roleCodes,
        boolean truncated) {
}
