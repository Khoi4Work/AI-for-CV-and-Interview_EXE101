package fpt.su26.exe101.backend.modules.interview.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.interview.repository.InterviewQuestionRepository;
import fpt.su26.exe101.backend.modules.interview.dto.InterviewSpeechTransition;
import fpt.su26.exe101.backend.modules.interview.service.InterviewVoiceService;
import fpt.su26.exe101.backend.modules.interview.service.InterviewSpeechScriptService;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.ai.audio.tts.TextToSpeechModel;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import java.time.Duration;
import java.util.UUID;

@Service
@Slf4j
public class ElevenLabsInterviewVoiceService implements InterviewVoiceService {
    private final InterviewQuestionRepository questionRepository;
    private final TextToSpeechModel textToSpeechModel;
    private final InterviewSpeechScriptService speechScriptService;

    public ElevenLabsInterviewVoiceService(
            InterviewQuestionRepository questionRepository,
            @Qualifier("elevenLabsSpeechModel") TextToSpeechModel textToSpeechModel,
            InterviewSpeechScriptService speechScriptService) {
        this.questionRepository = questionRepository;
        this.textToSpeechModel = textToSpeechModel;
        this.speechScriptService = speechScriptService;
    }

    @Value("${spring.ai.elevenlabs.api-key}")
    private String elevenLabsApiKey;
    @Value("${interview.voice.stt-model:scribe_v2}")
    private String transcriptionModel;
    @Value("${spring.ai.elevenlabs.tts.options.model-id:}")
    private String speechModelId;

    @Override
    public byte[] synthesizeQuestionAudio(UUID questionId, InterviewSpeechTransition transition) {
        var question = questionRepository.findById(questionId)
                .filter(candidate -> candidate.isActive())
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Interview question not found"));
        String speechText = speechScriptService.compose(question, transition, speechModelId);
        log.info("[INTERVIEW TTS] Request started | provider=elevenlabs | model={} | questionId={} | transition={} | scriptChars={}",
                speechModelId == null || speechModelId.isBlank() ? "provider-default" : speechModelId,
                questionId, transition == null ? InterviewSpeechTransition.START : transition, speechText.length());
        long startedAt = System.nanoTime();
        byte[] audio;
        try {
            audio = textToSpeechModel.call(speechText);
        } catch (RuntimeException exception) {
            log.error("[INTERVIEW TTS] Audio generation failed | provider=elevenlabs | model={} | questionId={} | scriptChars={} | durationMs={} | errorType={}",
                    speechModelId, questionId, speechText.length(), elapsedMs(startedAt),
                    exception.getClass().getSimpleName(), exception);
            throw exception;
        }
        if (audio == null || audio.length == 0) {
            log.error("[INTERVIEW TTS] Audio generation returned empty audio | provider=elevenlabs | model={} | questionId={} | scriptChars={} | durationMs={}",
                    speechModelId, questionId, speechText.length(), elapsedMs(startedAt));
            throw new IllegalStateException("Voice provider returned an empty audio response.");
        }
        log.info("[INTERVIEW TTS] Audio generated | provider=elevenlabs | model={} | questionId={} | scriptChars={} | audioBytes={} | durationMs={}",
                speechModelId, questionId, speechText.length(), audio.length, elapsedMs(startedAt));
        return audio;
    }

    private long elapsedMs(long startedAt) {
        return Duration.ofNanos(System.nanoTime() - startedAt).toMillis();
    }

    @Override
    public String transcribeAnswerAudio(byte[] audio, String filename, String contentType, String language) {
        if (audio == null || audio.length == 0) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Audio file must not be empty.");
        }
        if (elevenLabsApiKey == null || elevenLabsApiKey.isBlank()) {
            throw new IllegalStateException("ElevenLabs API key is not configured in the backend runtime.");
        }
        MultipartBodyBuilder multipart = new MultipartBodyBuilder();
        ByteArrayResource audioResource = new ByteArrayResource(audio) {
            @Override
            public String getFilename() {
                return filename == null || filename.isBlank() ? "interview-answer.webm" : filename;
            }
        };
        multipart.part("file", audioResource)
                .contentType(contentType == null || contentType.isBlank()
                        ? MediaType.APPLICATION_OCTET_STREAM : MediaType.parseMediaType(contentType));
        multipart.part("model_id", transcriptionModel);
        if (language != null && !language.isBlank()) multipart.part("language_code", language);

        try {
            TranscriptionResponse result = WebClient.builder()
                    .baseUrl("https://api.elevenlabs.io/v1")
                    .defaultHeader("xi-api-key", elevenLabsApiKey.trim())
                    .build()
                    .post()
                    .uri("/speech-to-text")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(multipart.build()))
                    .retrieve()
                    .bodyToMono(TranscriptionResponse.class)
                    .block(Duration.ofSeconds(90));
            if (result == null || result.text() == null || result.text().isBlank()) {
                throw new IllegalStateException("Voice provider returned an empty transcript.");
            }
            return result.text().trim();
        } catch (WebClientResponseException exception) {
            log.error("[INTERVIEW STT] Transcription request failed | provider=elevenlabs | httpStatus={} | audioSizeBytes={}",
                    exception.getStatusCode().value(), audio.length, exception);
            throw new IllegalStateException("Voice transcription provider returned HTTP "
                    + exception.getStatusCode().value() + ".", exception);
        }
    }

    private record TranscriptionResponse(
            String text,
            @JsonProperty("language_code") String languageCode) {}
}
