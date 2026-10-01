package fpt.su26.exe101.backend.modules.interview.repository;

import fpt.su26.exe101.backend.modules.interview.entity.InterviewQuestion;
import fpt.su26.exe101.backend.modules.interview.entity.enums.ExperienceLevel;
import fpt.su26.exe101.backend.modules.interview.entity.enums.InterviewType;
import fpt.su26.exe101.backend.modules.interview.entity.enums.QuestionRole;
import fpt.su26.exe101.backend.modules.interview.entity.enums.QuestionContextType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, UUID> {
    List<InterviewQuestion> findByBank_InterviewTypeAndBank_ExperienceLevelAndQuestionRoleAndContextTypeInAndActiveTrueOrderByCreatedAtAsc(
            InterviewType interviewType, ExperienceLevel experienceLevel, QuestionRole questionRole,
            List<QuestionContextType> contextTypes);
}
