package fpt.su26.exe101.backend.modules.cv.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.dto.CVFeedbackContent;
import fpt.su26.exe101.backend.modules.cv.dto.response.*;
import fpt.su26.exe101.backend.modules.cv.entity.CV;
import fpt.su26.exe101.backend.modules.cv.entity.CVTemplate;
import fpt.su26.exe101.backend.modules.cv.repository.CVTemplateRepository;
import fpt.su26.exe101.backend.modules.cv.service.TemplateAccessPolicy;
import fpt.su26.exe101.backend.modules.cv.entity.CVFeedback;
import fpt.su26.exe101.backend.modules.cv.entity.CVOptimizationJob;
import fpt.su26.exe101.backend.modules.cv.entity.CVOptimizationLog;
import fpt.su26.exe101.backend.modules.cv.repository.CVFeedbackRepository;
import fpt.su26.exe101.backend.modules.cv.repository.CVOptimizationJobRepository;
import fpt.su26.exe101.backend.modules.cv.repository.CVOptimizationLogRepository;
import fpt.su26.exe101.backend.modules.cv.repository.CVRepository;
import fpt.su26.exe101.backend.modules.cv.dto.request.CVCreateRequestDTO;
import fpt.su26.exe101.backend.modules.cv.dto.request.CVOptimizationRequestDTO;
import fpt.su26.exe101.backend.modules.cv.dto.request.CVUpdateRequestDTO;
import fpt.su26.exe101.backend.modules.gallery.entity.*;
import fpt.su26.exe101.backend.modules.cv.entity.enums.OptimizationState;
import fpt.su26.exe101.backend.modules.cv.mapper.CVMapper;
import fpt.su26.exe101.backend.modules.cv.mapper.CVFeedbackMapper;
import fpt.su26.exe101.backend.modules.gallery.service.GalleryService;
import fpt.su26.exe101.backend.modules.cv.service.AIProviderService;
import fpt.su26.exe101.backend.modules.cv.service.CVPipelineService;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import fpt.su26.exe101.backend.base.enums.UserPlan;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class CVPipelineServiceImpl implements CVPipelineService {

    private static final Pattern VIETNAMESE_DIACRITICS = Pattern.compile("[\\u0102\\u0103\\u0110\\u0111\\u0128-\\u0129\\u0168-\\u0169\\u01A0-\\u01A1\\u01AF-\\u01B0\\u1EA0-\\u1EF9]");

    private final CVRepository cvRepository;
    private final CVTemplateRepository templateRepository;
    private final CVFeedbackRepository feedbackRepository;
    private final CVOptimizationLogRepository logRepository;
    private final CVOptimizationJobRepository jobRepository;
    private final GalleryService galleryService;
    private final UsageQuotaService quotaService;
    private final AIProviderService aiProvider;
    private final CVMapper cvMapper;
    private final CVFeedbackMapper feedbackMapper;
    private final ObjectProvider<CVPipelineServiceImpl> selfProvider;

    @Override
    @Transactional(readOnly = true)
    public List<CVResponseDTO> getCVsForGallery(Gallery gallery) {
        return cvMapper.cvsToCVResponses(cvRepository.findByGalleryId(gallery.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public CV getCVForInterview(UUID cvId, Gallery gallery) {
        return cvRepository.findById(cvId)
                .filter(candidate -> candidate.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "CV not found"));
    }

    @Override
    @Transactional
    public void deleteCV(UUID id, Gallery gallery) {
        CV cv = cvRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "CV not found"));
        if (!cv.getGallery().getId().equals(gallery.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION);
        }
        cvRepository.delete(cv);
    }

    @Transactional
    @Override
    public CVResponseDTO createCV(CVCreateRequestDTO request, Gallery gallery) {
        validateDraft(request.getName(), request.getContent());
        CVTemplate template = resolveTemplate(request.getTemplateId(), request.getContent(), null, gallery);
        quotaService.consumeCvCreation(gallery.getAccountId());
        CV cv = CV.builder()
                .name(request.getName().trim())
                .template(template)
                .content(request.getContent())
                .gallery(gallery)
                .optimizationState(OptimizationState.DRAFT)
                .status("DRAFT")
                .build();
        cvRepository.save(cv);
        log.info("[CV] Created draft | cvId={} | galleryId={}", cv.getId(), gallery.getId());
        return cvMapper.cvToCVResponse(cv);
    }

    @Transactional
    @Override
    public CVResponseDTO updateCV(UUID id, CVUpdateRequestDTO request, Gallery gallery) {
        CV cv = cvRepository.findById(id)
                .filter(c -> c.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "CV not found"));

        validateDraft(request.getName(), request.getContent());
        CVTemplate template = resolveTemplate(request.getTemplateId(), request.getContent(), cv.getTemplate(), gallery);
        cv.setName(request.getName().trim());
        cv.setTemplate(template);
        cv.setContent(request.getContent());
        cvRepository.save(cv);
        return cvMapper.cvToCVResponse(cv);
    }

    private void validateDraft(String name, CVContent content) {
        if (name == null || name.isBlank() || name.trim().length() > 100 || content == null) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Tên CV phải có từ 1 đến 100 ký tự và nội dung không được trống.");
        }
    }

    private CVTemplate resolveTemplate(String requestedId, CVContent content, CVTemplate existing, Gallery gallery) {
        String contentId = content.getSelectedTemplateId();
        if (requestedId != null && contentId != null && !requestedId.equals(contentId)) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Mẫu CV trong nội dung không khớp templateId.");
        }
        String id = requestedId != null ? requestedId : contentId;
        if (id == null && existing != null) id = existing.getId();
        // Legacy import/evaluation drafts may not have chosen a template yet.
        if (id == null) return null;
        CVTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Mẫu CV không tồn tại."));
        if (!TemplateAccessPolicy.canUse(quotaService.getCvPlan(gallery.getAccountId()), template.getMinimumPlan())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION, "Gói CV hiện tại không cho phép sử dụng mẫu này.");
        }
        content.setSelectedTemplateId(template.getId());
        return template;
    }

    @Override
    @Transactional
    public CVImportResponseDTO importCV(byte[] fileContent, String contentType, String filename, Gallery gallery) {
        String sourceHash = sha256(fileContent);
        Optional<CV> existing = cvRepository.findByGalleryIdAndSourceHash(gallery.getId(), sourceHash);
        if (existing.isPresent()) {
            CV cv = existing.get();
            log.info("[CV] Import completed | cvId={} | galleryId={} | duplicate=true",
                    cv.getId(), gallery.getId());
            return CVImportResponseDTO.builder().cvId(cv.getId()).sourceHash(sourceHash).duplicate(true)
                    .extractedData(cv.getContent()).build();
        }
        CVImportModelResponseDTO parsed = aiProvider.parseCVFile(fileContent, contentType);
        CVContent extractedData = parsed == null ? null : parsed.getExtractedData();
        if (parsed == null || !Boolean.TRUE.equals(parsed.getIsCV()) || extractedData == null) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Tệp tải lên không được nhận diện là CV hợp lệ.");
        }
        if (!hasCVContent(extractedData)) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "CV không có đủ thông tin cá nhân, học vấn hoặc kinh nghiệm để nhập.");
        }
        quotaService.consumeCvCreation(gallery.getAccountId());
        String cvName = filename == null || filename.isBlank() ? "Imported CV" : filename;
        if (cvName.length() > 100) cvName = cvName.substring(0, 100);
        CV draft = CV.builder().name(cvName).content(extractedData).gallery(gallery)
                .sourceHash(sourceHash).optimizationState(OptimizationState.DRAFT).status("DRAFT").build();
        cvRepository.save(draft);
        log.info("[CV] Import completed | cvId={} | galleryId={} | duplicate=false",
                draft.getId(), gallery.getId());
        return CVImportResponseDTO.builder()
                .extractedData(extractedData)
                .cvId(draft.getId())
                .sourceHash(sourceHash)
                .duplicate(false)
                .build();
    }

    @Override
    public CVContent extractCV(byte[] fileContent, String contentType, Gallery gallery) {
        String sourceHash = sha256(fileContent);
        Optional<CV> existing = cvRepository.findByGalleryIdAndSourceHash(gallery.getId(), sourceHash);
        if (existing.isPresent()) {
            log.info("[CV] Reused saved CV content for builder import | cvId={} | galleryId={}",
                    existing.get().getId(), gallery.getId());
            return existing.get().getContent();
        }

        CVImportModelResponseDTO parsed = aiProvider.parseCVFile(fileContent, contentType);
        CVContent extractedData = parsed == null ? null : parsed.getExtractedData();
        if (parsed == null || !Boolean.TRUE.equals(parsed.getIsCV()) || extractedData == null) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Tệp tải lên không được nhận diện là CV hợp lệ.");
        }
        if (!hasCVContent(extractedData)) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "CV không có đủ thông tin cá nhân, học vấn hoặc kinh nghiệm để điền.");
        }
        return extractedData;
    }

    private boolean hasCVContent(CVContent data) {
        long populatedSections = List.of(
                data.getPersonalInfo() != null && hasPersonalInfo(data.getPersonalInfo()),
                hasText(data.getSummary()),
                data.getExperiences() != null && data.getExperiences().stream().anyMatch(this::hasExperience),
                data.getEducation() != null && data.getEducation().stream().anyMatch(this::hasEducation),
                data.getSkills() != null && data.getSkills().stream().anyMatch(skill -> skill != null && hasText(skill.getName())),
                data.getProjects() != null && data.getProjects().stream().anyMatch(this::hasProject),
                data.getCertificates() != null && data.getCertificates().stream().anyMatch(certificate -> certificate != null && hasText(certificate.getName()))
        ).stream().filter(Boolean::booleanValue).count();
        boolean hasResumeSection = (data.getPersonalInfo() != null && hasPersonalInfo(data.getPersonalInfo()))
                || hasText(data.getSummary())
                || (data.getExperiences() != null && data.getExperiences().stream().anyMatch(this::hasExperience))
                || (data.getEducation() != null && data.getEducation().stream().anyMatch(this::hasEducation));
        return populatedSections >= 2 && hasResumeSection;
    }

    private boolean hasPersonalInfo(CVContent.PersonalInfo info) {
        return hasText(info.getName()) || hasText(info.getEmail()) || hasText(info.getPhone());
    }

    private boolean hasExperience(CVContent.Experience experience) {
        return experience != null && (hasText(experience.getCompany()) || hasText(experience.getRole())
                || (experience.getDetails() != null && experience.getDetails().stream().anyMatch(this::hasText)));
    }

    private boolean hasEducation(CVContent.Education education) {
        return education != null && (hasText(education.getSchool()) || hasText(education.getDegree()) || hasText(education.getYear()));
    }

    private boolean hasProject(CVContent.Project project) {
        return project != null && (hasText(project.getName()) || (project.getDetails() != null && project.getDetails().stream().anyMatch(this::hasText)));
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String sha256(byte[] content) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(content));
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is unavailable", e);
        }
    }

    private JobDescription findOrCreateJD(String jdText, Gallery gallery) {
        return galleryService.findOrCreateJobDescription(jdText, gallery);
    }

    @Transactional
    @Override
    public CVOptimizationJobResponseDTO startOptimization(UUID cvId, CVOptimizationRequestDTO request, Gallery gallery) {
        requirePlan(gallery.getAccountId(), UserPlan.ENHANCE);
        CV cv = cvRepository.findById(cvId)
                .filter(c -> c.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));

        quotaService.consumeCvAiAnalysis(gallery.getAccountId());

        String jobId = UUID.randomUUID().toString();
        CVOptimizationJob job = CVOptimizationJob.builder()
                .jobId(jobId)
                .cvId(cvId)
                .status("PENDING")
                .progress(0)
                .startedAt(LocalDateTime.now())
                .build();
        jobRepository.save(job);

        UUID galleryId = gallery.getId();
        UUID accountId = gallery.getAccountId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                log.info("[CV OPTIMIZATION] Job queued | cvId={} | galleryId={} | jobId={}",
                        cvId, galleryId, jobId);
                selfProvider.getObject().processOptimization(jobId, cvId, galleryId, accountId, request);
            }
        });

        return CVOptimizationJobResponseDTO.builder()
                .jobId(jobId)
                .status("PENDING")
                .estimatedTime(60)
                .build();
    }

    @Async
    public void processOptimization(String jobId, UUID cvId, UUID galleryId, UUID accountId, CVOptimizationRequestDTO request) {
        CVOptimizationJob job = jobRepository.findByJobId(jobId)
                .orElse(null);
        if (job == null) {
            quotaService.refundCvAiAnalysis(accountId);
            log.error("[CV OPTIMIZATION] Job record not found; quota refunded | cvId={} | galleryId={} | jobId={}",
                    cvId, galleryId, jobId);
            return;
        }

        long startedAtNanos = System.nanoTime();
        log.info("[CV OPTIMIZATION] Started | cvId={} | galleryId={} | jobId={}", cvId, galleryId, jobId);
        try {
            CV cv = cvRepository.findWithGalleryById(cvId)
                    .filter(candidate -> candidate.getGallery().getId().equals(galleryId))
                    .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "CV not found for optimization job"));
            job.setStatus("PROCESSING");
            job.setProgress(10);
            jobRepository.save(job);

            String jdText = (request.getJdText() != null)
                    ? request.getJdText()
                    : galleryService.findJobDescription(request.getJdId(), cv.getGallery()).getContent();

            cv.setOptimizationState(OptimizationState.ANALYZING);
            cvRepository.save(cv);

            CVOptimizationResultResponseDTO result = aiProvider.optimizeCV(cv.getContent(), jdText).join();

            job.setProgress(70);
            jobRepository.save(job);

            cv.setContent(result.getOptimizedContent());
            cv.setOptimizationState(OptimizationState.OPTIMIZED);
            cv.setScore(result.getPredictedScore());
            cvRepository.save(cv);

            CVOptimizationLog summaryLog = CVOptimizationLog.builder()
                    .cv(cv)
                    .sectionName("OVERALL")
                    .originalText("N/A")
                    .suggestedText(result.getImprovementSummary())
                    .isAccepted(true)
                    .build();
            logRepository.save(summaryLog);
            if (result.getImprovements() != null) {
                result.getImprovements().stream()
                        .filter(item -> item != null && item.getSuggestedText() != null && !item.getSuggestedText().isBlank())
                        .limit(8)
                        .forEach(item -> logRepository.save(CVOptimizationLog.builder()
                                .cv(cv)
                                .sectionName(item.getSectionName() == null || item.getSectionName().isBlank() ? "OTHER" : item.getSectionName())
                                .originalText(item.getOriginalText() == null ? "" : item.getOriginalText())
                                .suggestedText(item.getSuggestedText())
                                .isAccepted(true)
                                .build()));
            }

            job.setStatus("COMPLETED");
            job.setProgress(100);
            job.setCompletedAt(LocalDateTime.now());
            jobRepository.save(job);
            log.info("[CV OPTIMIZATION] Completed | cvId={} | galleryId={} | jobId={} | durationMs={}",
                    cvId, galleryId, jobId, (System.nanoTime() - startedAtNanos) / 1_000_000);

        } catch (Exception e) {
            log.error("[CV OPTIMIZATION] Failed | cvId={} | galleryId={} | jobId={} | errorType={} | durationMs={}",
                    cvId, galleryId, jobId, e.getClass().getSimpleName(),
                    (System.nanoTime() - startedAtNanos) / 1_000_000, e);
            quotaService.refundCvAiAnalysis(accountId);
            job.setStatus("FAILED");
            job.setErrorMessage(e.getMessage());
            jobRepository.save(job);
        }
    }

    @Override
    public CVOptimizationStatusResponseDTO getOptimizationStatus(String jobId) {
        CVOptimizationJob job = jobRepository.findByJobId(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        return CVOptimizationStatusResponseDTO.builder()
                .jobId(jobId)
                .status(job.getStatus())
                .progress(job.getProgress())
                .build();
    }

    @Override
    public CVOptimizationResultResponseDTO getOptimizationResult(String jobId) {
        CVOptimizationJob job = jobRepository.findByJobId(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!"COMPLETED".equals(job.getStatus())) {
            throw new RuntimeException("Result not ready yet");
        }

        CV cv = cvRepository.findById(job.getCvId())
                .orElseThrow(() -> new RuntimeException("CV not found"));
        List<CVOptimizationLog> logs = logRepository.findByCvId(cv.getId()).stream()
                .filter(log -> log.getCreatedAt() != null && !log.getCreatedAt().isBefore(job.getCreatedAt()))
                .toList();

        return CVOptimizationResultResponseDTO.builder()
                .optimizedContent(cv.getContent())
                .improvementSummary(logs.stream()
                        .filter(log -> "OVERALL".equals(log.getSectionName()))
                        .reduce((first, second) -> second)
                        .map(CVOptimizationLog::getSuggestedText)
                        .orElse("CV đã được rà soát theo mô tả công việc."))
                .improvements(logs.stream()
                        .filter(log -> !"OVERALL".equals(log.getSectionName()))
                        .map(log -> CVOptimizationChangeResponseDTO.builder()
                                .sectionName(log.getSectionName())
                                .originalText(log.getOriginalText())
                                .suggestedText(log.getSuggestedText())
                                .build())
                        .toList())
                .predictedScore(cv.getScore())
                .build();
    }

    @Override
    public CVEvaluationResponseDTO evaluateCV(UUID cvId, UUID jdId, Gallery gallery) {
        CV cv = cvRepository.findById(cvId)
                .filter(c -> c.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new RuntimeException("CV not found or access denied"));

        JobDescription jd = galleryService.findJobDescription(jdId, gallery);
        return evaluateAndConsume(cv, jd, gallery);
    }

    @Transactional
    @Override
    public CVEvaluationResponseDTO evaluateCV(UUID cvId, String jdText, Gallery gallery) {
        CV cv = cvRepository.findById(cvId).filter(c -> c.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
        JobDescription jd = findOrCreateJD(jdText, gallery);
        return evaluateAndConsume(cv, jd, gallery);
    }

    private CVEvaluationResponseDTO evaluateAndConsume(CV cv, JobDescription jd, Gallery gallery) {
        quotaService.consumeCvAiAnalysis(gallery.getAccountId());
        try {
            CVEvaluationResponseDTO result = aiProvider.evaluateCV(cv.getContent(), jd.getContent(), quotaService.getCvPlan(gallery.getAccountId()));
            result.setJdId(jd.getId());
            return result;
        } catch (RuntimeException e) {
            quotaService.refundCvAiAnalysis(gallery.getAccountId());
            throw e;
        }
    }

    @Override
    @Transactional
    public CVAnalysisResponseDTO analyzeCV(UUID cvId, String jdText, Gallery gallery) {
        CV cv = cvRepository.findById(cvId)
                .filter(item -> item.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "CV not found"));
        JobDescription jd = findOrCreateJD(jdText, gallery);
        long startedAtNanos = System.nanoTime();
        log.info("[CV ANALYSIS] Started | cvId={} | galleryId={} | jdId={}",
                cvId, gallery.getId(), jd.getId());
        try {
            quotaService.consumeCvAiAnalysis(gallery.getAccountId());
            UserPlan plan = quotaService.getCvPlan(gallery.getAccountId());
            CVEvaluationResponseDTO evaluation = aiProvider.evaluateCV(cv.getContent(), jd.getContent(), plan);
            evaluation.setJdId(jd.getId());
            CVSkillGapResponseDTO skillGap;
            CVFeedbackResponseDTO feedback;
            if (plan == UserPlan.FREE) {
                skillGap = CVSkillGapResponseDTO.builder().matchingSkills(List.of()).missingSkills(List.of()).build();
                feedback = CVFeedbackResponseDTO.builder().overallScore(evaluation.getScore()).build();
            } else {
                skillGap = aiProvider.analyzeSkillGap(cv.getContent(), jd.getContent());
                Optional<CVFeedback> prior = feedbackRepository.findByCvIdAndJobDescriptionId(cvId, jd.getId());
                if (prior.isPresent() && hasVietnameseFeedback(prior.get())) {
                    feedback = toFeedbackResponse(prior.get());
                } else {
                    feedback = aiProvider.generateFeedback(cv.getContent(), jd.getContent());
                    CVFeedback saved = prior.orElseGet(() -> CVFeedback.builder().cv(cv).jobDescription(jd).build());
                    saved.setOverallScore(feedback.getOverallScore());
                    saved.setFeedbackJson(feedback.getFeedback());
                    saved = feedbackRepository.save(saved);
                    feedback.setId(saved.getId());
                }
            }

            log.info("[CV ANALYSIS] Completed | cvId={} | galleryId={} | jdId={} | score={} | durationMs={}",
                    cvId, gallery.getId(), jd.getId(), evaluation.getScore(),
                    (System.nanoTime() - startedAtNanos) / 1_000_000);
            return CVAnalysisResponseDTO.builder().evaluation(evaluation).skillGap(skillGap).feedback(feedback).build();
        } catch (RuntimeException e) {
            log.error("[CV ANALYSIS] Failed | cvId={} | galleryId={} | jdId={} | errorType={} | durationMs={}",
                    cvId, gallery.getId(), jd.getId(), e.getClass().getSimpleName(),
                    (System.nanoTime() - startedAtNanos) / 1_000_000, e);
            throw e;
        }
    }

    @Override
    public CVFeedbackResponseDTO requestFeedback(UUID cvId, UUID jdId, Gallery gallery) {
        requirePlan(gallery.getAccountId(), UserPlan.MIDDLE);
        CV cv = cvRepository.findById(cvId)
                .filter(c -> c.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new RuntimeException("CV not found or access denied"));

        JobDescription jd = galleryService.findJobDescription(jdId, gallery);

        Optional<CVFeedback> prior = feedbackRepository.findByCvIdAndJobDescriptionId(cvId, jdId);
        if (prior.isPresent() && hasVietnameseFeedback(prior.get())) return toFeedbackResponse(prior.get());
        quotaService.consumeCvAiAnalysis(gallery.getAccountId());
        CVFeedbackResponseDTO feedbackResponse;
        try { feedbackResponse = aiProvider.generateFeedback(cv.getContent(), jd.getContent()); }
        catch (RuntimeException e) { quotaService.refundCvAiAnalysis(gallery.getAccountId()); throw e; }

        CVFeedback feedback = prior.orElseGet(() -> CVFeedback.builder().cv(cv).jobDescription(jd).build());
        feedback.setOverallScore(feedbackResponse.getOverallScore());
        feedback.setFeedbackJson(feedbackResponse.getFeedback());
        feedbackRepository.save(feedback);
        feedbackResponse.setId(feedback.getId());
        return feedbackResponse;
    }

    private CVFeedbackResponseDTO toFeedbackResponse(CVFeedback f) {
        return feedbackMapper.toResponse(f);
    }

    private boolean hasVietnameseFeedback(CVFeedback feedback) {
        if (feedback == null || feedback.getFeedbackJson() == null) return false;
        CVFeedbackContent content = feedback.getFeedbackJson();
        List<String> text = new ArrayList<>();
        if (content.getSwot() != null) {
            text.addAll(safeList(content.getSwot().getStrengths()));
            text.addAll(safeList(content.getSwot().getWeaknesses()));
            text.addAll(safeList(content.getSwot().getOpportunities()));
            text.addAll(safeList(content.getSwot().getThreats()));
        }
        if (content.getSectionAnalysis() != null) {
            content.getSectionAnalysis().forEach(section -> {
                if (section == null) return;
                text.add(section.getSectionName());
                text.addAll(safeList(section.getStrengths()));
                text.addAll(safeList(section.getWeaknesses()));
                text.addAll(safeList(section.getSuggestions()));
            });
        }
        return text.stream().filter(Objects::nonNull).anyMatch(value -> VIETNAMESE_DIACRITICS.matcher(value).find());
    }

    private List<String> safeList(List<String> values) {
        return values == null ? List.of() : values;
    }

    @Override
    public CVFeedbackResponseDTO getFeedback(UUID cvId, UUID jdId, Gallery gallery) {
        cvRepository.findById(cvId).filter(cv -> cv.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
        galleryService.findJobDescription(jdId, gallery);
        return feedbackRepository.findByCvIdAndJobDescriptionId(cvId, jdId).map(this::toFeedbackResponse)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND,
                        "Feedback has not been generated for this CV and job description yet. "
                                + "Call POST /api/cv/{id}/feedback first."));
    }

    @Override
    public CVSkillGapResponseDTO analyzeSkillGap(UUID cvId, UUID jdId, Gallery gallery) {
        requirePlan(gallery.getAccountId(), UserPlan.MIDDLE);
        CV cv = cvRepository.findById(cvId)
                .filter(c -> c.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new RuntimeException("CV not found or access denied"));

        String jdText = galleryService.findJobDescription(jdId, gallery).getContent();

        quotaService.consumeCvAiAnalysis(gallery.getAccountId());
        try { return aiProvider.analyzeSkillGap(cv.getContent(), jdText); }
        catch (RuntimeException e) { quotaService.refundCvAiAnalysis(gallery.getAccountId()); throw e; }
    }

    private void requirePlan(UUID accountId, UserPlan minimumPlan) {
        if (quotaService.getCvPlan(accountId).ordinal() < minimumPlan.ordinal()) {
            throw new ApiException(ErrorCode.QUOTA_EXCEEDED, "This CV feature requires the " + minimumPlan + " plan.");
        }
    }
}
