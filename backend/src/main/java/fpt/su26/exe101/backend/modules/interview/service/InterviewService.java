package fpt.su26.exe101.backend.modules.interview.service;

import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewSessionResponseDTO;
import fpt.su26.exe101.backend.modules.interview.dto.request.CreateInterviewSessionRequestDTO;
import fpt.su26.exe101.backend.modules.interview.dto.request.SubmitInterviewAnswerRequestDTO;
import fpt.su26.exe101.backend.modules.interview.dto.response.CreateInterviewSessionResponseDTO;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewAnswerResponseDTO;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewEvaluationResponseDTO;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewSessionDetailResponseDTO;

import java.util.List;
import java.util.UUID;

public interface InterviewService {
    CreateInterviewSessionResponseDTO createSession(CreateInterviewSessionRequestDTO request);
    InterviewAnswerResponseDTO submitAnswer(UUID sessionId, SubmitInterviewAnswerRequestDTO request);
    InterviewAnswerResponseDTO submitAudioAnswer(UUID sessionId, UUID questionId, byte[] audio,
                                                  String filename, String contentType);
    InterviewEvaluationResponseDTO evaluateSession(UUID sessionId);
    InterviewSessionDetailResponseDTO getSessionDetail(UUID sessionId);
    List<InterviewSessionResponseDTO> getInterviewHistory();
    List<InterviewAnswerResponseDTO> getInterviewAnswers(UUID sessionId);
}
