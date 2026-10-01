package fpt.su26.exe101.backend.modules.interview.service;

import java.util.UUID;

public interface InterviewVoiceService {
    byte[] synthesizeQuestionAudio(UUID questionId);
    String transcribeAnswerAudio(byte[] audio, String filename, String contentType, String language);
}
