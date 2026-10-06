package fpt.su26.exe101.backend.modules.cv.service;

import java.util.UUID;

public interface CVAnalysisQuotaService {
    void consume(UUID accountId, UUID cvId);

    void refund(UUID accountId, UUID cvId);
}
