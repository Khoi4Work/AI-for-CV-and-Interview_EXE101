package fpt.su26.exe101.backend.modules.quota.service.impl;

import fpt.su26.exe101.backend.modules.interview.entity.InterviewSession;
import fpt.su26.exe101.backend.modules.interview.entity.enums.InterviewSessionStatus;
import fpt.su26.exe101.backend.modules.interview.repository.InterviewSessionRepository;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class InterviewReservationCleanupJob {
    private final InterviewSessionRepository sessionRepository;
    private final UsageQuotaService usageQuotaService;

    @Scheduled(cron = "0 15 * * * *")
    @Transactional
    public void releaseAbandonedInterviewReservations() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cutoff = now.minusHours(24);
        for (InterviewSession session : sessionRepository
                .findByStatusAndInterviewQuotaSettledFalseAndReservedInterviewMinutesGreaterThanAndSessionDateLessThan(
                        InterviewSessionStatus.IN_PROGRESS, 0, cutoff)) {
            int actualMinutes = 0;
            if (session.getInterviewStartedAt() != null) {
                LocalDateTime lastActivity = session.getInterviewLastActivityAt() == null
                        ? session.getInterviewStartedAt() : session.getInterviewLastActivityAt();
                long elapsed = java.time.Duration.between(session.getInterviewStartedAt(), lastActivity).getSeconds();
                actualMinutes = (int) Math.ceil(Math.max(0, elapsed) / 60.0);
                actualMinutes = Math.min(Math.max(1, actualMinutes), session.getReservedInterviewMinutes());
            }
            int unused = session.getReservedInterviewMinutes() - actualMinutes;
            if (unused > 0) usageQuotaService.refundInterviewMinutes(session.getGallery().getAccountId(), unused);
            session.setReservedInterviewMinutes(actualMinutes);
            session.setInterviewQuotaSettled(true);
            session.setCompletedAt(now);
            session.setStatus(InterviewSessionStatus.COMPLETED);
            log.info("[INTERVIEW] Abandoned reservation settled | sessionId={} | chargedMinutes={} | refundedMinutes={}",
                    session.getId(), actualMinutes, unused);
        }
    }

}
