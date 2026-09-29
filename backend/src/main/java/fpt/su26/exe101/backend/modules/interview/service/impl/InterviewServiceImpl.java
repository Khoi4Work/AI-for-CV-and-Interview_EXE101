package fpt.su26.exe101.backend.modules.interview.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.interview.dto.request.SubmitInterviewAnswerRequestDTO;
import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.modules.cv.entity.CV;
import fpt.su26.exe101.backend.modules.cv.service.CVPipelineService;
import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescription;
import fpt.su26.exe101.backend.modules.gallery.service.GalleryService;
import fpt.su26.exe101.backend.modules.interview.dto.request.CreateInterviewSessionRequestDTO;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewAnswerResponseDTO;
import fpt.su26.exe101.backend.modules.interview.dto.response.CreateInterviewSessionResponseDTO;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewQuestionResponseDTO;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewEvaluationResponseDTO;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewSessionResponseDTO;
import fpt.su26.exe101.backend.modules.interview.entity.InterviewQuestion;
import fpt.su26.exe101.backend.modules.interview.entity.InterviewAnswer;
import fpt.su26.exe101.backend.modules.interview.entity.InterviewSession;
import fpt.su26.exe101.backend.modules.interview.entity.enums.ExperienceLevel;
import fpt.su26.exe101.backend.modules.interview.entity.enums.InterviewType;
import fpt.su26.exe101.backend.modules.interview.entity.enums.QuestionContextType;
import fpt.su26.exe101.backend.modules.interview.entity.enums.QuestionRole;
import fpt.su26.exe101.backend.modules.interview.entity.enums.InterviewSessionStatus;
import fpt.su26.exe101.backend.modules.interview.mapper.InterviewMapper;
import fpt.su26.exe101.backend.modules.interview.repository.InterviewAnswerRepository;
import fpt.su26.exe101.backend.modules.interview.repository.InterviewQuestionRepository;
import fpt.su26.exe101.backend.modules.interview.repository.InterviewSessionRepository;
import fpt.su26.exe101.backend.modules.interview.service.InterviewService;
import fpt.su26.exe101.backend.modules.interview.service.InterviewAIProvider;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {
    private final InterviewSessionRepository sessionRepository;
    private final InterviewAnswerRepository answerRepository;
    private final InterviewMapper interviewMapper;
    private final GalleryService galleryService;
    private final InterviewQuestionRepository questionRepository;
    private final CVPipelineService cvPipelineService;
    private final UsageQuotaService usageQuotaService;
    private final ObjectMapper objectMapper;
    private final InterviewAIProvider interviewAIProvider;

    @Override
    @Transactional
    public CreateInterviewSessionResponseDTO createSession(CreateInterviewSessionRequestDTO request) {
        Gallery gallery = galleryService.getCurrentGallery();
        InterviewType type = parseInterviewType(request.getInterviewType());
        ExperienceLevel level = parseExperienceLevel(request.getExperienceLevel());
        validateSessionOptions(request);

        UserPlan plan = usageQuotaService.getPlan(gallery.getAccountId());
        int maxDuration = switch (plan) {
            case FREE -> 5;
            case MIDDLE -> 10;
            case ENHANCE -> 15;
        };
        if (request.getDurationMinutes() > maxDuration) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION,
                    "Your current plan allows interviews up to " + maxDuration + " minutes.");
        }

        CV cv = request.getCvId() == null ? null : cvPipelineService.getCVForInterview(request.getCvId(), gallery);
        JobDescription jd = resolveJobDescription(request, gallery);
        int requestedQuestionCount = switch (request.getDurationMinutes()) {
            case 5 -> 3;
            case 10 -> 5;
            case 15 -> 7;
            default -> throw new ApiException(ErrorCode.INVALID_INPUT,
                    "durationMinutes must be one of 5, 10, or 15.");
        };

        List<QuestionContextType> availableContexts = new ArrayList<>();
        availableContexts.add(QuestionContextType.GENERAL);
        if (jd != null) availableContexts.add(QuestionContextType.JD);
        if (cv != null) availableContexts.add(QuestionContextType.CV);
        if (cv != null && jd != null) availableContexts.add(QuestionContextType.JD_AND_CV);
        List<InterviewQuestion> questions = questionRepository
                .findByBank_InterviewTypeAndBank_ExperienceLevelAndQuestionRoleAndContextTypeInAndActiveTrueOrderByCreatedAtAsc(
                        type, level, QuestionRole.PRIMARY, availableContexts)
                .stream()
                .sorted(Comparator.comparingInt(question -> contextPriority(
                        question.getContextType(), cv != null, jd != null)))
                .limit(requestedQuestionCount)
                .toList();
        if (questions.size() < requestedQuestionCount) {
            throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND,
                    "Not enough active " + type + " questions for experience level " + level + ".");
        }

        Map<String, Object> snapshot = new HashMap<>();
        snapshot.put("language", request.getLanguage());
        snapshot.put("adaptiveMode", false);
        if (cv != null) {
            snapshot.put("cv", Map.of("id", cv.getId().toString(), "name", cv.getName(),
                    "content", objectMapper.convertValue(cv.getContent(), new TypeReference<Map<String, Object>>() {})));
        }
        if (jd != null) {
            snapshot.put("jd", Map.of("id", jd.getId().toString(), "title", jd.getTitle(), "content", jd.getContent()));
        }
        List<Map<String, Object>> questionSnapshot = new ArrayList<>();
        for (InterviewQuestion question : questions) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", question.getId().toString());
            item.put("text", question.getQuestionText());
            item.put("category", question.getCategory());
            item.put("competency", question.getCompetency());
            item.put("gradingCriteria", question.getGradingCriteria());
            questionSnapshot.add(item);
        }
        snapshot.put("questions", questionSnapshot);

        InterviewSession session = InterviewSession.builder()
                .gallery(gallery)
                .cv(cv)
                .jobDescription(jd)
                .interviewType(type)
                .durationMinutes(request.getDurationMinutes())
                .candidateExperienceLevel(level.name())
                .contextSnapshot(snapshot)
                .sessionDate(LocalDateTime.now())
                .status(InterviewSessionStatus.IN_PROGRESS)
                .build();
        InterviewSession saved = sessionRepository.save(session);

        List<InterviewQuestionResponseDTO> responseQuestions = questions.stream()
                .map(question -> InterviewQuestionResponseDTO.builder()
                        .id(question.getId())
                        .text(question.getQuestionText())
                        .category(question.getCategory())
                        .competency(question.getCompetency())
                        .build())
                .toList();
        return CreateInterviewSessionResponseDTO.builder()
                .id(saved.getId())
                .interviewType(type)
                .durationMinutes(saved.getDurationMinutes())
                .experienceLevel(level)
                .language(request.getLanguage())
                .adaptiveMode(false)
                .questions(responseQuestions)
                .build();
    }

    @Override
    @Transactional
    public InterviewAnswerResponseDTO submitAnswer(UUID sessionId, SubmitInterviewAnswerRequestDTO request) {
        Gallery gallery = galleryService.getCurrentGallery();
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Interview session not found"));
        if (!session.getGallery().getId().equals(gallery.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION);
        }
        if (session.getStatus() == InterviewSessionStatus.COMPLETED) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Interview session is already completed.");
        }
        validateAnswer(request);
        if (!sessionContainsQuestion(session, request.getQuestionId())) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Question does not belong to this interview session.");
        }
        if (answerRepository.existsBySessionIdAndQuestionId(sessionId, request.getQuestionId())) {
            throw new ApiException(ErrorCode.DUPLICATE_RESOURCE, "An answer for this question already exists.");
        }

        InterviewAnswer answer = answerRepository.save(InterviewAnswer.builder()
                .session(session)
                .questionId(request.getQuestionId())
                .answerText(request.getAnswerText())
                .audioUrl(request.getAudioUrl())
                .isSkipped(request.getIsSkipped())
                .build());
        return InterviewAnswerResponseDTO.builder()
                .id(answer.getId())
                .sessionId(sessionId)
                .questionId(answer.getQuestionId())
                .answerText(answer.getAnswerText())
                .audioUrl(answer.getAudioUrl())
                .isSkipped(answer.getIsSkipped())
                .build();
    }

    @Override
    @Transactional
    public InterviewEvaluationResponseDTO evaluateSession(UUID sessionId) {
        Gallery gallery = galleryService.getCurrentGallery();
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Interview session not found"));
        if (!session.getGallery().getId().equals(gallery.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION);
        }
        UserPlan plan = usageQuotaService.getPlan(gallery.getAccountId());
        if (plan == UserPlan.FREE) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION, "Interview feedback is available on MIDDLE and ENHANCE plans.");
        }
        if (session.getFeedbackJson() != null) {
            InterviewEvaluationResponseDTO saved = objectMapper.convertValue(
                    session.getFeedbackJson(), InterviewEvaluationResponseDTO.class);
            saved.setSessionId(session.getId());
            return saved;
        }

        List<InterviewAnswer> answers = answerRepository.findBySession(session);
        if (answers.stream().noneMatch(answer -> !Boolean.TRUE.equals(answer.getIsSkipped())
                && answer.getAnswerText() != null && !answer.getAnswerText().isBlank())) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "At least one non-skipped transcribed answer is required for evaluation.");
        }
        boolean containsAudioOnlyAnswer = answers.stream().anyMatch(answer -> !Boolean.TRUE.equals(answer.getIsSkipped())
                && (answer.getAnswerText() == null || answer.getAnswerText().isBlank())
                && answer.getAudioUrl() != null && !answer.getAudioUrl().isBlank());
        if (containsAudioOnlyAnswer) {
            throw new ApiException(ErrorCode.INVALID_INPUT,
                    "Audio-only answers must be transcribed by the BE voice flow before evaluation.");
        }

        Map<String, Object> transcript = new HashMap<>();
        transcript.put("interviewType", session.getInterviewType().name());
        transcript.put("experienceLevel", session.getCandidateExperienceLevel());
        transcript.put("durationMinutes", session.getDurationMinutes());
        transcript.put("questionsAndAnswers", buildQuestionsAndAnswers(session, answers));
        InterviewEvaluationResponseDTO evaluation = interviewAIProvider.evaluate(transcript, plan);
        evaluation.setSessionId(session.getId());
        session.setOverallScore(evaluation.getOverallScore());
        session.setFeedbackJson(objectMapper.convertValue(evaluation,
                new TypeReference<Map<String, Object>>() {}));
        session.setStatus(InterviewSessionStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        sessionRepository.save(session);
        return evaluation;
    }

    @Override
    public List<InterviewSessionResponseDTO> getInterviewHistory() {
        Gallery gallery = galleryService.getCurrentGallery();
        return interviewMapper.sessionsToSessionResponses(sessionRepository.findByGallery(gallery));
    }

    private JobDescription resolveJobDescription(CreateInterviewSessionRequestDTO request, Gallery gallery) {
        if (request.getJdId() != null && request.getJdText() != null && !request.getJdText().isBlank()) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Provide either jdId or jdText, not both.");
        }
        if (request.getJdId() != null) return galleryService.findJobDescription(request.getJdId(), gallery);
        if (request.getJdText() != null && !request.getJdText().isBlank()) {
            return galleryService.findOrCreateJobDescription(request.getJdText(), gallery);
        }
        return null;
    }

    private void validateAnswer(SubmitInterviewAnswerRequestDTO request) {
        boolean hasText = request.getAnswerText() != null && !request.getAnswerText().isBlank();
        boolean hasAudio = request.getAudioUrl() != null && !request.getAudioUrl().isBlank();
        if (Boolean.TRUE.equals(request.getIsSkipped())) {
            if (hasText || hasAudio) {
                throw new ApiException(ErrorCode.INVALID_INPUT, "A skipped answer cannot include text or audio.");
            }
            return;
        }
        if (!hasText && !hasAudio) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Provide answerText or audioUrl, or mark the answer as skipped.");
        }
    }

    @SuppressWarnings("unchecked")
    private boolean sessionContainsQuestion(InterviewSession session, UUID questionId) {
        Object rawQuestions = session.getContextSnapshot().get("questions");
        if (!(rawQuestions instanceof List<?> questions)) return false;
        for (Object rawQuestion : questions) {
            if (rawQuestion instanceof Map<?, ?> question
                    && questionId.toString().equals(String.valueOf(question.get("id")))) {
                return true;
            }
        }
        return false;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> buildQuestionsAndAnswers(InterviewSession session, List<InterviewAnswer> answers) {
        Map<UUID, InterviewAnswer> answersByQuestion = new HashMap<>();
        answers.forEach(answer -> answersByQuestion.put(answer.getQuestionId(), answer));
        Object rawQuestions = session.getContextSnapshot().get("questions");
        if (!(rawQuestions instanceof List<?> questions)) return List.of();
        List<Map<String, Object>> transcriptEntries = new ArrayList<>();
        for (Object rawQuestion : questions) {
            if (!(rawQuestion instanceof Map<?, ?> rawMap)) continue;
            Object rawId = rawMap.get("id");
            if (rawId == null) continue;
            UUID questionId = UUID.fromString(String.valueOf(rawId));
            InterviewAnswer answer = answersByQuestion.get(questionId);
            if (answer == null) continue;
            Map<String, Object> entry = new HashMap<>();
            entry.put("questionId", questionId.toString());
            entry.put("question", rawMap.get("text"));
            entry.put("category", rawMap.get("category"));
            entry.put("competency", rawMap.get("competency"));
            entry.put("gradingCriteria", rawMap.get("gradingCriteria"));
            entry.put("answer", answer.getAnswerText());
            entry.put("skipped", Boolean.TRUE.equals(answer.getIsSkipped()));
            transcriptEntries.add(entry);
        }
        return transcriptEntries;
    }

    private int contextPriority(QuestionContextType questionContext, boolean hasCv, boolean hasJd) {
        if (hasCv && hasJd && questionContext == QuestionContextType.JD_AND_CV) return 0;
        if (hasJd && questionContext == QuestionContextType.JD) return 1;
        if (hasCv && questionContext == QuestionContextType.CV) return 1;
        return questionContext == QuestionContextType.GENERAL ? 2 : 3;
    }

    private void validateSessionOptions(CreateInterviewSessionRequestDTO request) {
        if (request.getDurationMinutes() == null
                || !List.of(5, 10, 15).contains(request.getDurationMinutes())) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "durationMinutes must be one of 5, 10, or 15.");
        }
        if (request.getLanguage() == null || !List.of("vi", "en").contains(request.getLanguage().toLowerCase())) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "language must be 'vi' or 'en'.");
        }
        if (Boolean.TRUE.equals(request.getAdaptiveMode())) {
            throw new ApiException(ErrorCode.INVALID_INPUT,
                    "Adaptive interview mode is not available yet. Set adaptiveMode to false.");
        }
    }

    private InterviewType parseInterviewType(String value) {
        try {
            return InterviewType.valueOf(value.trim().replace(' ', '_').toUpperCase());
        } catch (RuntimeException exception) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "interviewType must be HR, Technical, or Behavioral.");
        }
    }

    private ExperienceLevel parseExperienceLevel(String value) {
        try {
            return ExperienceLevel.valueOf(value.trim().toUpperCase());
        } catch (RuntimeException exception) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "experienceLevel must be Intern, Fresher, or Junior.");
        }
    }

    @Override
    public List<InterviewAnswerResponseDTO> getInterviewAnswers(UUID sessionId) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Interview session not found"));
        Gallery gallery = galleryService.getCurrentGallery();
        if (!session.getGallery().getId().equals(gallery.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION);
        }
        return interviewMapper.answersToAnswerResponses(answerRepository.findBySession(session));
    }
}
