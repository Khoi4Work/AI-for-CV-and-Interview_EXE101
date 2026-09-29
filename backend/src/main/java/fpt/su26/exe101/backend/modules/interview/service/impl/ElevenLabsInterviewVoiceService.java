package fpt.su26.exe101.backend.modules.interview.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.interview.repository.InterviewQuestionRepository;
import fpt.su26.exe101.backend.modules.interview.service.InterviewVoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.audio.tts.TextToSpeechModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ElevenLabsInterviewVoiceService implements InterviewVoiceService {
    private final InterviewQuestionRepository questionRepository;
    private final TextToSpeechModel textToSpeechModel;

    @Override
    @Transactional(readOnly = true)
    public byte[] synthesizeQuestionAudio(UUID questionId) {
        String questionText = questionRepository.findById(questionId)
                .filter(question -> question.isActive())
                .map(question -> question.getQuestionText())
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Interview question not found"));
        byte[] audio = textToSpeechModel.call(questionText);
        if (audio == null || audio.length == 0) {
            throw new IllegalStateException("Voice provider returned an empty audio response.");
        }
        return audio;
    }
}
