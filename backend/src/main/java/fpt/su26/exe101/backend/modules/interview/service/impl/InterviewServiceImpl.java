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
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewSessionDetailResponseDTO;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewSessionResponseDTO;
import fpt.su26.exe101.backend.modules.interview.dto.InterviewQuestionGenerationDTO;
import fpt.su26.exe101.backend.modules.interview.entity.InterviewQuestion;
import fpt.su26.exe101.backend.modules.interview.entity.InterviewQuestionBank;
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
import fpt.su26.exe101.backend.modules.interview.repository.InterviewQuestionBankRepository;
import fpt.su26.exe101.backend.modules.interview.repository.InterviewSessionRepository;
import fpt.su26.exe101.backend.modules.interview.service.InterviewService;
import fpt.su26.exe101.backend.modules.interview.service.InterviewAIProvider;
import fpt.su26.exe101.backend.modules.interview.service.InterviewVoiceService;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.UUID;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewServiceImpl implements InterviewService {
    private final InterviewSessionRepository sessionRepository;
    private final InterviewAnswerRepository answerRepository;
    private final InterviewMapper interviewMapper;
    private final GalleryService galleryService;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewQuestionBankRepository questionBankRepository;
    private final CVPipelineService cvPipelineService;
    private final UsageQuotaService usageQuotaService;
    private final ObjectMapper objectMapper;
    private final InterviewAIProvider interviewAIProvider;
    private final InterviewVoiceService interviewVoiceService;
    private final InterviewQuestionRelevanceService questionRelevanceService;

    @Override
    @Transactional
    public CreateInterviewSessionResponseDTO createSession(CreateInterviewSessionRequestDTO request) {
        Gallery gallery = galleryService.getCurrentGallery();
        usageQuotaService.initializeDefaultQuota(gallery.getAccountId());
        InterviewType type = parseInterviewType(request.getInterviewType());
        ExperienceLevel level = parseExperienceLevel(request.getExperienceLevel());
        validateSessionOptions(request);
        String language = request.getLanguage().trim().toLowerCase(Locale.ROOT);

        UserPlan plan = usageQuotaService.getInterviewPlan(gallery.getAccountId());
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
        String candidateContext = cv == null ? null : buildCandidateContext(cv);
        List<InterviewQuestion> questionCandidates = findQuestionCandidates(type, level, language, availableContexts);
        List<InterviewQuestion> questions = cv == null
                ? prioritizeQuestions(questionCandidates, false, jd != null, requestedQuestionCount)
                : questionRelevanceService.findRelevantQuestions(questionCandidates, candidateContext,
                        requestedQuestionCount);
        log.info("[INTERVIEW QUESTIONS] Bank retrieval completed | type={} | language={} | cvProvided={} | candidateCount={} | relevantCount={} | requiredCount={}",
                type, language, cv != null, questionCandidates.size(), questions.size(), requestedQuestionCount);
        if (questions.size() < requestedQuestionCount) {
            int missingCount = requestedQuestionCount - questions.size();
            InterviewQuestionGenerationDTO generated = interviewAIProvider.generateQuestions(
                    type, level, missingCount, language, candidateContext);
            InterviewQuestionBank generalBank = questionBankRepository
                    .findFirstByCompanyIsNullAndInterviewTypeAndExperienceLevel(type, level)
                    .orElseGet(() -> questionBankRepository.save(InterviewQuestionBank.builder()
                            .company(null)
                            .interviewType(type)
                            .experienceLevel(level)
                            .industry(null)
                            .build()));
            List<InterviewQuestion> newQuestions = generated.getQuestions().stream()
                    .map(draft -> InterviewQuestion.builder()
                            .bank(generalBank)
                            .questionText(draft.getText().trim())
                            .language(language)
                            .sampleAnswer(draft.getSampleAnswer())
                            .gradingCriteria(draft.getGradingCriteria())
                            .category(draft.getCategory())
                            .competency(draft.getCompetency())
                            .questionRole(QuestionRole.PRIMARY)
                            .contextType(QuestionContextType.GENERAL)
                            .active(true)
                            .build())
                    .toList();
            List<InterviewQuestion> savedGeneratedQuestions = questionRepository.saveAll(newQuestions);
            if (cv == null) {
                questionCandidates = findQuestionCandidates(type, level, language, availableContexts);
                questions = prioritizeQuestions(questionCandidates, false, jd != null, requestedQuestionCount);
            } else {
                List<InterviewQuestion> completedSelection = new ArrayList<>(questions);
                for (InterviewQuestion generatedQuestion : savedGeneratedQuestions) {
                    if (completedSelection.stream().noneMatch(question -> question.getId().equals(generatedQuestion.getId()))) {
                        completedSelection.add(generatedQuestion);
                    }
                    if (completedSelection.size() == requestedQuestionCount) break;
                }
                questions = completedSelection;
            }
        }
        if (questions.size() < requestedQuestionCount) {
            throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND,
                    "Not enough active " + type + " questions for experience level " + level + ".");
        }

        Map<String, Object> snapshot = new HashMap<>();
        snapshot.put("language", language);
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

        usageQuotaService.consumeInterviewMinutes(gallery.getAccountId(), request.getDurationMinutes());
        InterviewSession session = InterviewSession.builder()
                .gallery(gallery)
                .cv(cv)
                .jobDescription(jd)
                .interviewType(type)
                .durationMinutes(request.getDurationMinutes())
                .candidateExperienceLevel(level.name())
                .contextSnapshot(snapshot)
                .sessionDate(LocalDateTime.now())
                .interviewStartedAt(LocalDateTime.now())
                .reservedInterviewMinutes(request.getDurationMinutes())
                .status(InterviewSessionStatus.IN_PROGRESS)
                .build();
        InterviewSession saved = sessionRepository.save(session);
        log.info("[INTERVIEW] Session created | sessionId={} | galleryId={} | cvId={} | jdId={} | type={} | language={} | durationMinutes={} | questionCount={}",
                saved.getId(), gallery.getId(), cv == null ? "none" : cv.getId(),
                jd == null ? "none" : jd.getId(), type, language, saved.getDurationMinutes(), questions.size());

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
        LocalDateTime answerSubmittedAt = LocalDateTime.now();
        if (session.getInterviewStartedAt() == null) session.setInterviewStartedAt(answerSubmittedAt);
        session.setInterviewLastActivityAt(answerSubmittedAt);
        log.info("[INTERVIEW] Answer submitted | sessionId={} | questionId={} | skipped={} | source=text",
                sessionId, answer.getQuestionId(), Boolean.TRUE.equals(answer.getIsSkipped()));
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
    public InterviewAnswerResponseDTO submitAudioAnswer(UUID sessionId, UUID questionId, byte[] audio,
                                                        String filename, String contentType) {
        Gallery gallery = galleryService.getCurrentGallery();
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Interview session not found"));
        if (!session.getGallery().getId().equals(gallery.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION);
        }
        if (session.getStatus() == InterviewSessionStatus.COMPLETED) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Interview session is already completed.");
        }
        if (!sessionContainsQuestion(session, questionId)) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Question does not belong to this interview session.");
        }
        if (answerRepository.existsBySessionIdAndQuestionId(sessionId, questionId)) {
            throw new ApiException(ErrorCode.DUPLICATE_RESOURCE, "An answer for this question already exists.");
        }
        String language = String.valueOf(session.getContextSnapshot().getOrDefault("language", "en"));
        String transcript = interviewVoiceService.transcribeAnswerAudio(audio, filename, contentType, language);
        InterviewAnswer answer = answerRepository.save(InterviewAnswer.builder()
                .session(session)
                .questionId(questionId)
                .answerText(transcript)
                .isSkipped(false)
                .build());
        LocalDateTime answerSubmittedAt = LocalDateTime.now();
        if (session.getInterviewStartedAt() == null) session.setInterviewStartedAt(answerSubmittedAt);
        session.setInterviewLastActivityAt(answerSubmittedAt);
        log.info("[INTERVIEW] Audio answer transcribed | sessionId={} | questionId={} | audioSizeBytes={}",
                sessionId, questionId, audio.length);
        return InterviewAnswerResponseDTO.builder()
                .id(answer.getId())
                .sessionId(sessionId)
                .questionId(questionId)
                .answerText(answer.getAnswerText())
                .audioUrl(null)
                .isSkipped(false)
                .build();
    }

    @Override
    @Transactional
    public void finishSession(UUID sessionId) {
        Gallery gallery = galleryService.getCurrentGallery();
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Interview session not found"));
        if (!session.getGallery().getId().equals(gallery.getId())) throw new ApiException(ErrorCode.FORBIDDEN_ACTION);
        if (!session.isInterviewQuotaSettled()) {
            LocalDateTime endedAt = LocalDateTime.now();
            settleInterviewReservation(session, gallery.getAccountId(), endedAt);
            session.setCompletedAt(endedAt);
            session.setStatus(InterviewSessionStatus.COMPLETED);
            sessionRepository.save(session);
        }
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
        UserPlan plan = usageQuotaService.getInterviewPlan(gallery.getAccountId());
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

        LocalDateTime interviewEndedAt = session.getCompletedAt() == null ? LocalDateTime.now() : session.getCompletedAt();
        settleInterviewReservation(session, gallery.getAccountId(), interviewEndedAt);

        Map<String, Object> transcript = new HashMap<>();
        transcript.put("interviewType", session.getInterviewType().name());
        transcript.put("experienceLevel", session.getCandidateExperienceLevel());
        transcript.put("durationMinutes", session.getDurationMinutes());
        transcript.put("questionsAndAnswers", buildQuestionsAndAnswers(session, answers));
        long startedAtNanos = System.nanoTime();
        InterviewEvaluationResponseDTO evaluation;
        try {
            evaluation = interviewAIProvider.evaluate(transcript, plan);
        } catch (RuntimeException e) {
            log.error("[INTERVIEW] Evaluation failed | sessionId={} | answerCount={} | errorType={} | durationMs={}",
                    session.getId(), answers.size(), e.getClass().getSimpleName(),
                    (System.nanoTime() - startedAtNanos) / 1_000_000, e);
            throw e;
        }
        evaluation.setSessionId(session.getId());
        session.setOverallScore(evaluation.getOverallScore());
        session.setFeedbackJson(objectMapper.convertValue(evaluation,
                new TypeReference<Map<String, Object>>() {}));
        session.setStatus(InterviewSessionStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        sessionRepository.save(session);
        log.info("[INTERVIEW] Evaluation completed | sessionId={} | answerCount={} | score={} | durationMs={}",
                session.getId(), answers.size(), evaluation.getOverallScore(),
                (System.nanoTime() - startedAtNanos) / 1_000_000);
        return evaluation;
    }

    private void settleInterviewReservation(InterviewSession session, UUID accountId, LocalDateTime endedAt) {
        if (session.isInterviewQuotaSettled() || session.getReservedInterviewMinutes() <= 0) return;
        int actualMinutes = 0;
        if (session.getInterviewStartedAt() != null) {
            long elapsedSeconds = java.time.Duration.between(session.getInterviewStartedAt(), endedAt).getSeconds();
            actualMinutes = (int) Math.ceil(Math.max(0, elapsedSeconds) / 60.0);
            actualMinutes = Math.min(Math.max(1, actualMinutes), session.getReservedInterviewMinutes());
        }
        int unusedMinutes = session.getReservedInterviewMinutes() - actualMinutes;
        if (unusedMinutes > 0) usageQuotaService.refundInterviewMinutes(accountId, unusedMinutes);
        session.setReservedInterviewMinutes(actualMinutes);
        session.setInterviewQuotaSettled(true);
        log.info("[INTERVIEW] Reserved minutes settled | sessionId={} | chargedMinutes={} | refundedMinutes={}",
                session.getId(), actualMinutes, unusedMinutes);
    }

    @Override
    @Transactional(readOnly = true)
    public InterviewSessionDetailResponseDTO getSessionDetail(UUID sessionId) {
        Gallery gallery = galleryService.getCurrentGallery();
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Interview session not found"));
        if (!session.getGallery().getId().equals(gallery.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION);
        }

        InterviewSessionResponseDTO sessionInfo = interviewMapper
                .sessionsToSessionResponses(List.of(session)).getFirst();
        List<InterviewAnswerResponseDTO> answers = mapHistoryAnswers(session);
        UserPlan plan = usageQuotaService.getInterviewPlan(gallery.getAccountId());
        InterviewEvaluationResponseDTO evaluation = null;
        if (plan == UserPlan.FREE) {
            sessionInfo.setFeedbackJson(null);
        } else if (session.getFeedbackJson() != null) {
            evaluation = objectMapper.convertValue(session.getFeedbackJson(), InterviewEvaluationResponseDTO.class);
            evaluation.setSessionId(session.getId());
        }
        return InterviewSessionDetailResponseDTO.builder()
                .sessionInfo(sessionInfo)
                .answers(answers)
                .evaluation(evaluation)
                .build();
    }

    @Override
    public List<InterviewSessionResponseDTO> getInterviewHistory() {
        Gallery gallery = galleryService.getCurrentGallery();
        List<InterviewSessionResponseDTO> sessions = interviewMapper
                .sessionsToSessionResponses(sessionRepository.findByGallery(gallery));
        if (usageQuotaService.getInterviewPlan(gallery.getAccountId()) == UserPlan.FREE) {
            sessions.forEach(session -> session.setFeedbackJson(null));
        }
        return sessions;
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
        if (hasAudio) {
            throw new ApiException(ErrorCode.INVALID_INPUT,
                    "Upload audio to /api/interview/sessions/{sessionId}/answers/audio for BE transcription.");
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

    private List<InterviewQuestion> findQuestionCandidates(InterviewType type, ExperienceLevel level, String language,
                                                           List<QuestionContextType> contexts) {
        return questionRepository
                .findByLanguageAndBank_InterviewTypeAndBank_ExperienceLevelAndQuestionRoleAndContextTypeInAndActiveTrueOrderByCreatedAtAsc(
                        language, type, level, QuestionRole.PRIMARY, contexts);
    }

    private List<InterviewQuestion> prioritizeQuestions(List<InterviewQuestion> candidates,
                                                        boolean hasCv, boolean hasJd, int limit) {
        return candidates.stream()
                .sorted(Comparator.comparingInt(question -> contextPriority(
                        question.getContextType(), hasCv, hasJd)))
                .limit(limit)
                .toList();
    }

    private String buildCandidateContext(CV cv) {
        ObjectNode content = objectMapper.valueToTree(cv.getContent());
        content.remove("personalInfo");
        content.remove("selectedTemplateId");
        removeFields(content, "experiences", "company");
        removeFields(content, "education", "school", "gpa");
        removeFields(content, "projects", "name", "url", "period");
        removeFields(content, "certificates", "issuer", "date", "url");
        removeFields(content, "awards", "issuer", "date");
        String candidateContext = content.toString();
        return candidateContext.length() > 10000 ? candidateContext.substring(0, 10000) : candidateContext;
    }

    private void removeFields(ObjectNode content, String listName, String... fields) {
        if (!(content.get(listName) instanceof ArrayNode items)) return;
        items.forEach(item -> {
            if (item instanceof com.fasterxml.jackson.databind.node.ObjectNode objectNode) {
                for (String field : fields) objectNode.remove(field);
            }
        });
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
        return mapHistoryAnswers(session);
    }

    private List<InterviewAnswerResponseDTO> mapHistoryAnswers(InterviewSession session) {
        List<InterviewAnswerResponseDTO> answers = interviewMapper
                .answersToAnswerResponses(answerRepository.findBySession(session));
        Map<String, String> questionTexts = new HashMap<>();
        Object snapshotQuestions = session.getContextSnapshot() == null
                ? null : session.getContextSnapshot().get("questions");
        if (snapshotQuestions instanceof List<?> questions) {
            for (Object item : questions) {
                if (item instanceof Map<?, ?> question && question.get("id") != null
                        && question.get("text") instanceof String text) {
                    questionTexts.put(question.get("id").toString(), text);
                }
            }
        }
        answers.forEach(answer -> {
            answer.setSessionId(session.getId());
            answer.setQuestionText(questionTexts.get(String.valueOf(answer.getQuestionId())));
        });
        return answers;
    }
}
