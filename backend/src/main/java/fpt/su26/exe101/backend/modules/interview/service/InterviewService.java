package fpt.su26.exe101.backend.modules.interview.service;

import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewAnswerResponseDTO;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewSessionResponseDTO;

import java.util.List;
import java.util.UUID;

public interface InterviewService {
    List<InterviewSessionResponseDTO> getInterviewHistory();
    List<InterviewAnswerResponseDTO> getInterviewAnswers(UUID sessionId);
}
