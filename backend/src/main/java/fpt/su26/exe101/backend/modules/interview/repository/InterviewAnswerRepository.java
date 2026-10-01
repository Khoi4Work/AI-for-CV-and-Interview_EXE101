package fpt.su26.exe101.backend.modules.interview.repository;

import fpt.su26.exe101.backend.modules.interview.entity.InterviewAnswer;
import fpt.su26.exe101.backend.modules.interview.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InterviewAnswerRepository extends JpaRepository<InterviewAnswer, UUID> {
    List<InterviewAnswer> findBySession(InterviewSession session);
    boolean existsBySessionIdAndQuestionId(UUID sessionId, UUID questionId);
}
