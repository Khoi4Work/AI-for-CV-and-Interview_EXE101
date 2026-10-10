package fpt.su26.exe101.backend.modules.cv.dto.request;

import java.util.UUID;

public record CVAnalysisStartRequestDTO(
        UUID jdId,
        String jdText,
        UUID derivedFromJdId) {
}
