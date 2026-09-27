package fpt.su26.exe101.backend.modules.gallery.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.gallery.dto.*;
import fpt.su26.exe101.backend.modules.gallery.entity.*;
import fpt.su26.exe101.backend.modules.gallery.entity.enums.OptimizationState;
import fpt.su26.exe101.backend.modules.gallery.mapper.GalleryMapper;
import fpt.su26.exe101.backend.modules.gallery.mapper.CVFeedbackMapper;
import fpt.su26.exe101.backend.modules.gallery.repository.*;
import fpt.su26.exe101.backend.modules.gallery.service.AIProviderService;
import fpt.su26.exe101.backend.modules.gallery.service.CVPipelineService;
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
    private final JobDescriptionRepository jdRepository;
    private final CVFeedbackRepository feedbackRepository;
    private final CVOptimizationLogRepository logRepository;
    private final CVOptimizationJobRepository jobRepository;
    private final UserUsageQuotaRepository quotaRepository;
    private final AIProviderService aiProvider;
    private final GalleryMapper galleryMapper;
    private final CVFeedbackMapper feedbackMapper;
    private final ObjectProvider<CVPipelineServiceImpl> selfProvider;

    @Transactional
    @Override
    public CVResponseDTO createCV(CVCreateRequestDTO request, Gallery gallery) {
        CV cv = CV.builder()
                .name(request.getName())
                .content(request.getContent())
                .gallery(gallery)
                .optimizationState(OptimizationState.DRAFT)
                .status("DRAFT")
                .build();
        cvRepository.save(cv);
        return galleryMapper.cvToCVResponse(cv);
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
        return galleryMapper.cvToCVResponse(cv);
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
        Map<String, Object> parsed = aiProvider.parseCVFile(fileContent, contentType);
        Object extracted = parsed.get("extractedData");
        if (!Boolean.TRUE.equals(parsed.get("isCV")) || !(extracted instanceof Map<?, ?> rawData)) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Tệp tải lên không được nhận diện là CV hợp lệ.");
        }
        Map<String, Object> extractedData = new HashMap<>();
        rawData.forEach((key, value) -> {
            if (key instanceof String stringKey) extractedData.put(stringKey, value);
        });
        if (!hasCVContent(extractedData)) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "CV không có đủ thông tin cá nhân, học vấn hoặc kinh nghiệm để nhập.");
        }
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

    private boolean hasCVContent(Map<String, Object> data) {
        List<String> sections = List.of("personalInfo", "summary", "experiences", "education", "skills", "projects", "certificates");
        long populatedSections = sections.stream().filter(section -> hasMeaningfulValue(data.get(section))).count();
        boolean hasResumeSection = hasMeaningfulValue(data.get("personalInfo"))
                || hasMeaningfulValue(data.get("summary"))
                || hasMeaningfulValue(data.get("experiences"))
                || hasMeaningfulValue(data.get("education"));
        return populatedSections >= 2 && hasResumeSection;
    }

    private boolean hasMeaningfulValue(Object value) {
        if (value instanceof String text) return !text.isBlank();
        if (value instanceof Map<?, ?> map) return map.values().stream().anyMatch(this::hasMeaningfulValue);
        if (value instanceof Collection<?> collection) return collection.stream().anyMatch(this::hasMeaningfulValue);
        return value instanceof Number;
    }

    private String sha256(byte[] content) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(content));
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is unavailable", e);
        }
    }

    private JobDescription findOrCreateJD(String jdText, Gallery gallery) {
        if (jdText == null || jdText.isBlank()) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "JD text must not be blank.");
        }
        String normalized = jdText.trim().replaceAll("\\s+", " ");
        String hash = sha256(normalized.getBytes(StandardCharsets.UTF_8));
        return jdRepository.findByGalleryIdAndContentHash(gallery.getId(), hash).orElseGet(() ->
                jdRepository.save(JobDescription.builder().gallery(gallery).title("User provided JD")
                        .content(jdText.trim()).contentHash(hash).build()));
    }

    @Transactional
    @Override
    public CVOptimizationJobResponseDTO startOptimization(UUID cvId, CVOptimizationRequestDTO request, Gallery gallery) {
        CV cv = cvRepository.findById(cvId)
                .filter(c -> c.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));

        // Quota Check
        UserUsageQuota quota = quotaRepository.findByAccountId(gallery.getAccountId())
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
        if (quota.getRemainingCvCnt() <= 0) {
            throw new ApiException(ErrorCode.QUOTA_EXCEEDED);
        }

        String jobId = UUID.randomUUID().toString();
        CVOptimizationJob job = CVOptimizationJob.builder()
                .jobId(jobId)
                .cvId(cvId)
                .status("PENDING")
                .progress(0)
                .startedAt(LocalDateTime.now())
                .build();
        jobRepository.save(job);

        // Deduct quota
        quota.setRemainingCvCnt(quota.getRemainingCvCnt() - 1);
        quotaRepository.save(quota);

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
                .orElseThrow(() -> new RuntimeException("Job not found"));

        try {
            job.setStatus("PROCESSING");
            job.setProgress(10);
            jobRepository.save(job);

            String jdText = (request.getJdText() != null)
                    ? request.getJdText()
                    : jdRepository.findById(request.getJdId())
                      .map(JobDescription::getContent)
                      .orElseThrow(() -> new RuntimeException("JD not found"));

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

        JobDescription jd = jdRepository.findById(jdId)
                .filter(description -> description.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new RuntimeException("JD not found"));
        CVEvaluationResponseDTO result = aiProvider.evaluateCV(cv.getContent(), jd.getContent());
        result.setJdId(jd.getId());
        return result;
    }

    @Transactional
    @Override
    public CVEvaluationResponseDTO evaluateCV(UUID cvId, String jdText, Gallery gallery) {
        CV cv = cvRepository.findById(cvId).filter(c -> c.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
        JobDescription jd = findOrCreateJD(jdText, gallery);
        CVEvaluationResponseDTO result = aiProvider.evaluateCV(cv.getContent(), jd.getContent());
        result.setJdId(jd.getId());
        return result;
    }

    @Override
    public CVFeedbackResponseDTO requestFeedback(UUID cvId, UUID jdId, Gallery gallery) {
        CV cv = cvRepository.findById(cvId)
                .filter(c -> c.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new RuntimeException("CV not found or access denied"));

        JobDescription jd = jdRepository.findById(jdId)
                .filter(description -> description.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new RuntimeException("JD not found"));

        Optional<CVFeedback> prior = feedbackRepository.findByCvIdAndJobDescriptionId(cvId, jdId);
        if (prior.isPresent()) return toFeedbackResponse(prior.get());
        CVFeedbackResponseDTO feedbackResponse = aiProvider.generateFeedback(cv.getContent(), jd.getContent());

        CVFeedback feedback = CVFeedback.builder()
                .cv(cv)
                .jobDescription(jd)
                .overallScore(feedbackResponse.getOverallScore())
                .feedbackJson(feedbackMapper.toFeedbackJson(feedbackResponse.getFeedback()))
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
        jdRepository.findById(jdId).filter(jd -> jd.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
        return feedbackRepository.findByCvIdAndJobDescriptionId(cvId, jdId).map(this::toFeedbackResponse)
                .orElseThrow(() -> new RuntimeException("No feedback available"));
    }

    @Override
    public CVSkillGapResponseDTO analyzeSkillGap(UUID cvId, UUID jdId, Gallery gallery) {
        CV cv = cvRepository.findById(cvId)
                .filter(c -> c.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new RuntimeException("CV not found or access denied"));

        String jdText = jdRepository.findById(jdId)
                .filter(jd -> jd.getGallery().getId().equals(gallery.getId()))
                .map(JobDescription::getContent)
                .orElseThrow(() -> new RuntimeException("JD not found"));

        return aiProvider.analyzeSkillGap(cv.getContent(), jdText);
    }
}
