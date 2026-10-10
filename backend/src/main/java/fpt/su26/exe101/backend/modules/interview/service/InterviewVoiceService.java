package fpt.su26.exe101.backend.modules.interview.service;

import fpt.su26.exe101.backend.modules.interview.dto.InterviewSpeechTransition;
import java.util.UUID;

public interface InterviewVoiceService {
    byte[] synthesizeQuestionAudio(UUID questionId, InterviewSpeechTransition transition);
    byte[] synthesizeSessionQuestionAudio(UUID sessionId, UUID questionId, InterviewSpeechTransition transition);
    String transcribeAnswerAudio(byte[] audio, String filename, String contentType, String language);
}
