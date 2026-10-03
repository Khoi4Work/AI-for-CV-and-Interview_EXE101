package fpt.su26.exe101.backend.modules.interview.repository;

import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;
import fpt.su26.exe101.backend.modules.interview.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;
import fpt.su26.exe101.backend.modules.interview.entity.enums.InterviewSessionStatus;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, UUID> {
    List<InterviewSession> findByGallery(Gallery gallery);

    List<InterviewSession> findByStatusAndInterviewQuotaSettledFalseAndReservedInterviewMinutesGreaterThanAndSessionDateLessThan(
            InterviewSessionStatus status, int minimumReservedMinutes, LocalDateTime cutoff);
}
