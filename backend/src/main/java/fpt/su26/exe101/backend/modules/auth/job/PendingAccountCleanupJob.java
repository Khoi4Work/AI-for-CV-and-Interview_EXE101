package fpt.su26.exe101.backend.modules.auth.job;

import fpt.su26.exe101.backend.modules.auth.service.PendingAccountCleanupService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
@Slf4j
public class PendingAccountCleanupJob {
    private final PendingAccountCleanupService service;
    private final boolean enabled;
    private final boolean dryRun;
    private final int batchSize;

    public PendingAccountCleanupJob(PendingAccountCleanupService service,
            @Value("${app.auth.pending-cleanup.enabled:true}") boolean enabled,
            @Value("${app.auth.pending-cleanup.dry-run:false}") boolean dryRun,
            @Value("${app.auth.pending-cleanup.batch-size:100}") int batchSize) {
        if (batchSize < 1) throw new IllegalArgumentException("Cleanup batch size must be positive");
        this.service = service;
        this.enabled = enabled;
        this.dryRun = dryRun;
        this.batchSize = batchSize;
    }

    @Scheduled(cron = "${app.auth.pending-cleanup.cron:0 0 3 * * *}",
            zone = "${app.auth.pending-cleanup.zone:Asia/Ho_Chi_Minh}")
    public void runDaily() {
        if (!enabled) return;
        LocalDateTime now = LocalDateTime.now();
        UUID cursor = null;
        int deleted = 0, wouldDelete = 0, skipped = 0, failed = 0;
        // Scan every candidate with bounded memory; protected early rows must not starve later ones.
        while (true) {
            List<UUID> candidates = service.findCandidates(now, cursor, batchSize);
            if (candidates.isEmpty()) break;
            for (UUID id : candidates) {
                try {
                    switch (service.cleanAccount(id, now, dryRun)) {
                        case DELETED -> deleted++;
                        case WOULD_DELETE -> wouldDelete++;
                        case SKIPPED -> skipped++;
                    }
                } catch (Exception e) {
                    failed++;
                    // Log no email/token or SQL parameters. Failed transaction preserves this account.
                    log.warn("Pending registration cleanup failed: accountId={}, errorType={}", id, e.getClass().getSimpleName());
                }
            }
            cursor = candidates.getLast();
            if (candidates.size() < batchSize) break;
        }
        log.info("Pending registration cleanup: dryRun={}, deleted={}, wouldDelete={}, skipped={}, failed={}",
                dryRun, deleted, wouldDelete, skipped, failed);
    }
}
