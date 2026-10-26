package fpt.su26.exe101.backend.modules.cv.dto.response;

import fpt.su26.exe101.backend.modules.cv.entity.enums.AnalysisStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record CVAnalysisHistoryResponseDTO(List<Item> items, int page, int size,
                                           long totalElements, boolean hasNext) {
    public record Item(UUID analysisId, UUID cvId, String cvName, String jdTitle,
                       String companyName, AnalysisStatus status, Integer score,
                       LocalDateTime createdAt) {}
}
