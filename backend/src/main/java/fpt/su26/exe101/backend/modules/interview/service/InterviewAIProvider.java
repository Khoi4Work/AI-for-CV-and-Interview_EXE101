package fpt.su26.exe101.backend.modules.interview.service;

import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewEvaluationResponseDTO;
import fpt.su26.exe101.backend.modules.interview.dto.InterviewQuestionGenerationDTO;
import fpt.su26.exe101.backend.modules.interview.entity.enums.ExperienceLevel;
import fpt.su26.exe101.backend.modules.interview.entity.enums.InterviewType;
import java.util.Map;

public interface InterviewAIProvider {
    InterviewEvaluationResponseDTO evaluate(Map<String, Object> transcript, UserPlan plan);
    InterviewQuestionGenerationDTO generateQuestions(InterviewType type, ExperienceLevel level, int count);
}
