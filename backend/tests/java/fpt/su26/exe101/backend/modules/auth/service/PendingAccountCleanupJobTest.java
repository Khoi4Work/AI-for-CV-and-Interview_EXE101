package fpt.su26.exe101.backend.modules.auth.service;

import fpt.su26.exe101.backend.modules.auth.job.PendingAccountCleanupJob;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PendingAccountCleanupJobTest {
    @Test
    void protectedEarlyBatchDoesNotStarveLaterEligibleAccounts() {
        PendingAccountCleanupService service = mock(PendingAccountCleanupService.class);
        UUID first = UUID.fromString("00000000-0000-0000-0000-000000000001");
        UUID second = UUID.fromString("00000000-0000-0000-0000-000000000002");
        when(service.findCandidates(any(LocalDateTime.class), isNull(), eq(1))).thenReturn(List.of(first));
        when(service.findCandidates(any(LocalDateTime.class), eq(first), eq(1))).thenReturn(List.of(second));
        when(service.findCandidates(any(LocalDateTime.class), eq(second), eq(1))).thenReturn(List.of());
        when(service.cleanAccount(eq(first), any(LocalDateTime.class), eq(false)))
                .thenReturn(PendingAccountCleanupService.Result.SKIPPED);
        when(service.cleanAccount(eq(second), any(LocalDateTime.class), eq(false)))
                .thenReturn(PendingAccountCleanupService.Result.DELETED);
        new PendingAccountCleanupJob(service, true, false, 1).runDaily();
        verify(service).cleanAccount(eq(second), any(LocalDateTime.class), eq(false));
        verify(service).findCandidates(any(LocalDateTime.class), eq(second), eq(1));
    }

    @Test
    void failedAccountDoesNotStopTheRemainingBatch() {
        PendingAccountCleanupService service = mock(PendingAccountCleanupService.class);
        UUID failed = UUID.randomUUID(), next = UUID.randomUUID();
        when(service.findCandidates(any(LocalDateTime.class), isNull(), eq(100))).thenReturn(List.of(failed, next));
        when(service.cleanAccount(eq(failed), any(LocalDateTime.class), eq(false)))
                .thenThrow(new IllegalStateException("Simulated dependency constraint"));
        when(service.cleanAccount(eq(next), any(LocalDateTime.class), eq(false)))
                .thenReturn(PendingAccountCleanupService.Result.DELETED);
        new PendingAccountCleanupJob(service, true, false, 100).runDaily();
        verify(service).cleanAccount(eq(next), any(LocalDateTime.class), eq(false));
    }
}
