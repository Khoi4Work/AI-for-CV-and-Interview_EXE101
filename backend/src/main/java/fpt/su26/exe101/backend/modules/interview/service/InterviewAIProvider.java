package fpt.su26.exe101.backend.modules.interview.service;

import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewEvaluationResponseDTO;
import java.util.Map;

public interface InterviewAIProvider {
    InterviewEvaluationResponseDTO evaluate(Map<String, Object> transcript, UserPlan plan);
}
