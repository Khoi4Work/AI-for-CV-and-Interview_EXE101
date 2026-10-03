package fpt.su26.exe101.backend.modules.auth.service;

import fpt.su26.exe101.backend.modules.auth.repository.VerificationMailOutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.data.domain.PageRequest;
import java.time.LocalDateTime;

@Component @RequiredArgsConstructor @Slf4j
public class VerificationMailJob {
    private final VerificationMailOutboxRepository outbox;
    private final VerificationMailDelivery delivery;

    @Scheduled(fixedDelayString = "${app.auth.verification.mail-poll-ms:10000}")
    public void sendDueMessages() {
        for (var id : outbox.findDueIds(LocalDateTime.now(), PageRequest.of(0, 25))) {
            try { delivery.deliver(id); }
            catch (RuntimeException e) {
                log.warn("[AUTH] Verification mail processing failed | mailId={} | errorType={}", id, e.getClass().getSimpleName());
            }
        }
    }
}
