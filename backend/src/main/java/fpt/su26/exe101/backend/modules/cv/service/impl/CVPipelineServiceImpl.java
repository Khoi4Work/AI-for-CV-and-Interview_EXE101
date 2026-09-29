package fpt.su26.exe101.backend.modules.cv.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.dto.response.*;
import fpt.su26.exe101.backend.modules.cv.entity.CV;
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

import java.time.LocalDateTime;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class CVPipelineServiceImpl implements CVPipelineService {

    private final CVRepository cvRepository;
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
        quotaService.consumeCvCreation(gallery.getAccountId());
        CV cv = CV.builder()
                .name(request.getName())
                .content(request.getContent())
                .gallery(gallery)
                .optimizationState(OptimizationState.DRAFT)
                .status("DRAFT")
                .build();
        cvRepository.save(cv);
        return cvMapper.cvToCVResponse(cv);
    }

    @Transactional
    @Override
    public CVResponseDTO updateCV(UUID id, CVUpdateRequestDTO request, Gallery gallery) {
        CV cv = cvRepository.findById(id)
                .filter(c -> c.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new RuntimeException("CV not found or access denied"));

        cv.setName(request.getName());
        cv.setContent(request.getContent());
        cvRepository.save(cv);
        return cvMapper.cvToCVResponse(cv);
    }

    @Override
    @Transactional
    public CVImportResponseDTO importCV(byte[] fileContent, String contentType, String filename, Gallery gallery) {
        String sourceHash = sha256(fileContent);
        Optional<CV> existing = cvRepository.findByGalleryIdAndSourceHash(gallery.getId(), sourceHash);
        if (existing.isPresent()) {
            CV cv = existing.get();
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
        return CVImportResponseDTO.builder()
                .extractedData(extractedData)
                .cvId(draft.getId())
                .sourceHash(sourceHash)
                .duplicate(false)
                .build();
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

        selfProvider.getObject().processOptimization(jobId, cv, request);

        return CVOptimizationJobResponseDTO.builder()
                .jobId(jobId)
                .status("PENDING")
                .estimatedTime(60)
                .build();
    }

    @Async
    public void processOptimization(String jobId, CV cv, CVOptimizationRequestDTO request) {
        CVOptimizationJob job = jobRepository.findByJobId(jobId)
                .orElse(null);
        if (job == null) {
            quotaService.refundCvAiAnalysis(cv.getGallery().getAccountId());
            log.error("Optimization job {} disappeared before processing; quota refunded", jobId);
            return;
        }

        try {
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

            CVOptimizationLog log = CVOptimizationLog.builder()
                    .cv(cv)
                    .sectionName("OVERALL")
                    .originalText("N/A")
                    .suggestedText(result.getImprovementSummary())
                    .isAccepted(true)
                    .build();
            logRepository.save(log);

            job.setStatus("COMPLETED");
            job.setProgress(100);
            job.setCompletedAt(LocalDateTime.now());
            jobRepository.save(job);

        } catch (Exception e) {
            log.error("Optimization failed for job {}: {}", jobId, e.getMessage());
            quotaService.refundCvAiAnalysis(cv.getGallery().getAccountId());
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

        return CVOptimizationResultResponseDTO.builder()
                .optimizedContent(cv.getContent())
                .improvementSummary("AI-optimized content based on the provided JD")
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
            CVEvaluationResponseDTO result = aiProvider.evaluateCV(cv.getContent(), jd.getContent(), quotaService.getPlan(gallery.getAccountId()));
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
        quotaService.consumeCvAiAnalysis(gallery.getAccountId());
        UserPlan plan = quotaService.getPlan(gallery.getAccountId());
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
            if (prior.isPresent()) {
                feedback = toFeedbackResponse(prior.get());
            } else {
                feedback = aiProvider.generateFeedback(cv.getContent(), jd.getContent());
                CVFeedback saved = feedbackRepository.save(CVFeedback.builder().cv(cv).jobDescription(jd)
                        .overallScore(feedback.getOverallScore()).feedbackJson(feedback.getFeedback()).build());
                feedback.setId(saved.getId());
            }
        }
        return CVAnalysisResponseDTO.builder().evaluation(evaluation).skillGap(skillGap).feedback(feedback).build();
    }

    @Override
    public CVFeedbackResponseDTO requestFeedback(UUID cvId, UUID jdId, Gallery gallery) {
        requirePlan(gallery.getAccountId(), UserPlan.MIDDLE);
        CV cv = cvRepository.findById(cvId)
                .filter(c -> c.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new RuntimeException("CV not found or access denied"));

        JobDescription jd = galleryService.findJobDescription(jdId, gallery);

        Optional<CVFeedback> prior = feedbackRepository.findByCvIdAndJobDescriptionId(cvId, jdId);
        if (prior.isPresent()) return toFeedbackResponse(prior.get());
        quotaService.consumeCvAiAnalysis(gallery.getAccountId());
        CVFeedbackResponseDTO feedbackResponse;
        try { feedbackResponse = aiProvider.generateFeedback(cv.getContent(), jd.getContent()); }
        catch (RuntimeException e) { quotaService.refundCvAiAnalysis(gallery.getAccountId()); throw e; }

        CVFeedback feedback = CVFeedback.builder()
                .cv(cv)
                .jobDescription(jd)
                .overallScore(feedbackResponse.getOverallScore())
                .feedbackJson(feedbackResponse.getFeedback())
                .build();
        feedbackRepository.save(feedback);
        feedbackResponse.setId(feedback.getId());
        return feedbackResponse;
    }

    private CVFeedbackResponseDTO toFeedbackResponse(CVFeedback f) {
        return feedbackMapper.toResponse(f);
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
        if (quotaService.getPlan(accountId).ordinal() < minimumPlan.ordinal()) {
            throw new ApiException(ErrorCode.QUOTA_EXCEEDED, "This CV feature requires the " + minimumPlan + " plan.");
        }
    }
}
