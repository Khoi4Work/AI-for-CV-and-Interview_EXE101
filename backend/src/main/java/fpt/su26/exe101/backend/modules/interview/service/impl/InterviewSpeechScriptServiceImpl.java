package fpt.su26.exe101.backend.modules.interview.service.impl;

import fpt.su26.exe101.backend.modules.interview.dto.InterviewSpeechTransition;
import fpt.su26.exe101.backend.modules.interview.entity.InterviewQuestion;
import fpt.su26.exe101.backend.modules.interview.service.InterviewSpeechScriptService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Slf4j
public class InterviewSpeechScriptServiceImpl implements InterviewSpeechScriptService {
    @Value("${interview.voice.delivery.enabled:true}")
    private boolean deliveryEnabled;
    @Value("${interview.voice.delivery.tagged-model-ids:eleven_v3,eleven_v4,eleven_v4_turbo}")
    private List<String> taggedModelIds;
    @Value("${interview.voice.delivery.tags.behavioral:[curious]}")
    private String behavioralTag;
    @Value("${interview.voice.delivery.tags.situational:[thoughtful]}")
    private String situationalTag;
    @Value("${interview.voice.delivery.tags.hr:[curious]}")
    private String hrTag;
    @Value("${interview.voice.delivery.phrases.vi.opening:Chào bạn, cảm ơn bạn đã tham gia buổi phỏng vấn. Chúng ta bắt đầu nhé.}")
    private String openingVi;
    @Value("${interview.voice.delivery.phrases.vi.after-answer:Cảm ơn bạn đã chia sẻ. Vậy thì,|Được rồi, mình chuyển sang câu tiếp theo nhé.|Cảm ơn bạn. Tiếp theo, mình muốn hỏi về điều này:}")
    private String afterAnswerVi;
    @Value("${interview.voice.delivery.phrases.vi.after-skip:Không sao, mình chuyển sang câu tiếp theo nhé.}")
    private String afterSkipVi;
    @Value("${interview.voice.delivery.phrases.en.opening:Hello, and thank you for joining. Let's get started.}")
    private String openingEn;
    @Value("${interview.voice.delivery.phrases.en.after-answer:Thank you for sharing that. Let's move on to the next question.|All right, let's continue with another question.|Thanks for that. I'd like to ask you about this next:}")
    private String afterAnswerEn;
    @Value("${interview.voice.delivery.phrases.en.after-skip:No problem, let's move on to the next question.}")
    private String afterSkipEn;

    @Override
    public String compose(InterviewQuestion question, InterviewSpeechTransition transition, String modelId) {
        String language = "en".equalsIgnoreCase(question.getLanguage()) ? "en" : "vi";
        String prefix = prefixFor(language, transition, question.getId());
        String emotionTag = deliveryEnabled && supportsAudioTags(modelId)
                ? tagForCategory(question.getCategory())
                : "";
        String questionText = question.getQuestionText() == null ? "" : question.getQuestionText().trim();
        String script = (emotionTag.isBlank() ? "" : emotionTag + " ")
                + prefix.trim() + " " + questionText;

        log.info("[INTERVIEW TTS] Script composed | provider=elevenlabs | model={} | language={} | transition={} | category={} | expressionTag={} | bridge=\"{}\" | question=\"{}\" | script=\"{}\"",
                safe(modelId), language, transition == null ? InterviewSpeechTransition.START : transition,
                safe(question.getCategory()), emotionTag.isBlank() ? "none" : emotionTag,
                oneLine(prefix), oneLine(questionText), oneLine(script));
        return script;
    }

    private String prefixFor(String language, InterviewSpeechTransition transition, UUID questionId) {
        boolean english = "en".equals(language);
        return switch (transition == null ? InterviewSpeechTransition.START : transition) {
            case START -> english ? openingEn : openingVi;
            case SKIPPED -> english ? afterSkipEn : afterSkipVi;
            case ANSWERED -> choose(english ? afterAnswerEn : afterAnswerVi, questionId);
        };
    }

    private boolean supportsAudioTags(String modelId) {
        if (modelId == null || modelId.isBlank()) return false;
        return taggedModelIds.stream().anyMatch(configured -> configured.equalsIgnoreCase(modelId.trim()));
    }

    private String normalizeCategory(String category) {
        if (category == null) return "";
        return category.trim().replace('-', '_').replace(' ', '_').toUpperCase(Locale.ROOT);
    }

    private String tagForCategory(String category) {
        return switch (normalizeCategory(category)) {
            case "BEHAVIORAL", "BEHAVIOURAL" -> behavioralTag;
            case "SITUATIONAL", "SCENARIO", "CASE_STUDY" -> situationalTag;
            case "HR" -> hrTag;
            default -> "";
        };
    }

    private String choose(String phrases, UUID questionId) {
        if (phrases == null || phrases.isBlank()) return "";
        String[] options = phrases.split("\\|");
        int index = questionId == null ? 0 : Math.floorMod(questionId.hashCode(), options.length);
        return options[index].trim();
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "unspecified" : oneLine(value);
    }

    private String oneLine(String value) {
        return value == null ? "" : value.replaceAll("\\s+", " ").trim();
    }
}
