package fpt.su26.exe101.backend.modules.interview.service.impl;

import com.fasterxml.jackson.annotation.JsonProperty;
import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.gallery.service.GalleryService;
import fpt.su26.exe101.backend.modules.interview.dto.InterviewSpeechTransition;
import fpt.su26.exe101.backend.modules.interview.entity.InterviewQuestion;
import fpt.su26.exe101.backend.modules.interview.repository.InterviewQuestionRepository;
import fpt.su26.exe101.backend.modules.interview.repository.InterviewSessionRepository;
import fpt.su26.exe101.backend.modules.interview.service.InterviewSpeechScriptService;
import fpt.su26.exe101.backend.modules.interview.service.InterviewVoiceService;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.audio.tts.TextToSpeechModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
@Slf4j
public class ElevenLabsInterviewVoiceService implements InterviewVoiceService {
    private final InterviewQuestionRepository questionRepository;
    private final TextToSpeechModel textToSpeechModel;
    private final InterviewSpeechScriptService speechScriptService;
    private final InterviewSessionRepository sessions;
    private final GalleryService galleries;

    public ElevenLabsInterviewVoiceService(
            InterviewQuestionRepository questionRepository,
            @Qualifier("elevenLabsSpeechModel") TextToSpeechModel textToSpeechModel,
            InterviewSpeechScriptService speechScriptService,
            InterviewSessionRepository sessions,
            GalleryService galleries) {
        this.questionRepository = questionRepository;
        this.textToSpeechModel = textToSpeechModel;
        this.speechScriptService = speechScriptService;
        this.sessions=sessions;this.galleries=galleries;
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
        return synthesize(question,transition);
    }

    @Override public byte[] synthesizeSessionQuestionAudio(UUID sessionId,UUID questionId,InterviewSpeechTransition transition) {
        var owner=galleries.getCurrentGallery();
        var session=sessions.findById(sessionId).filter(s->s.getGallery().getId().equals(owner.getId()))
            .orElseThrow(()->new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
        Object raw=session.getContextSnapshot().get("questions");
        if(raw instanceof List<?> questions) {
            for(Object item:questions) if(item instanceof Map<?,?> question && questionId.toString().equals(question.get("id"))) {
                var captured=InterviewQuestion.builder()
                    .questionText(String.valueOf(question.get("text"))).category(String.valueOf(question.get("category")))
                    .language(String.valueOf(session.getContextSnapshot().get("language"))).build();
                captured.setId(questionId);return synthesize(captured,transition);
            }
        }
        throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND,"Question is not part of this session.");
    }

    private byte[] synthesize(InterviewQuestion question,InterviewSpeechTransition transition) {
        UUID questionId=question.getId();
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
