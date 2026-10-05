package fpt.su26.exe101.backend.modules.auth.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface PendingAccountCleanupService {
    List<UUID> findCandidates(LocalDateTime now, UUID afterId, int batchSize);

    Result cleanAccount(UUID id, LocalDateTime now, boolean dryRun);

    enum Result { SKIPPED, WOULD_DELETE, DELETED }
}
