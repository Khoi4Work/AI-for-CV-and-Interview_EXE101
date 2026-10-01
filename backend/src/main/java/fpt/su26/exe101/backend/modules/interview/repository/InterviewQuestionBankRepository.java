package fpt.su26.exe101.backend.modules.interview.repository;

import fpt.su26.exe101.backend.modules.interview.entity.InterviewQuestionBank;
import fpt.su26.exe101.backend.modules.interview.entity.enums.ExperienceLevel;
import fpt.su26.exe101.backend.modules.interview.entity.enums.InterviewType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface InterviewQuestionBankRepository extends JpaRepository<InterviewQuestionBank, UUID> {
    Optional<InterviewQuestionBank> findFirstByCompanyIsNullAndInterviewTypeAndExperienceLevel(
            InterviewType interviewType, ExperienceLevel experienceLevel);
}
