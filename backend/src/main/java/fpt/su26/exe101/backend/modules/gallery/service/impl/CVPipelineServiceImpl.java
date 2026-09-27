package fpt.su26.exe101.backend.modules.gallery.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.gallery.dto.*;
import fpt.su26.exe101.backend.modules.gallery.entity.*;
import fpt.su26.exe101.backend.modules.gallery.entity.enums.OptimizationState;
import fpt.su26.exe101.backend.modules.gallery.mapper.GalleryMapper;
import fpt.su26.exe101.backend.modules.gallery.repository.*;
import fpt.su26.exe101.backend.modules.gallery.service.AIProviderService;
import fpt.su26.exe101.backend.modules.gallery.service.CVPipelineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
        return galleryMapper.cvToCVResponse(cvRepository.save(cv));
    }

    @Transactional
    @Override
    public CVResponseDTO updateCV(UUID id, CVUpdateRequestDTO request, Gallery gallery) {
        CV cv = cvRepository.findById(id)
                .filter(c -> c.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new RuntimeException("CV not found or access denied"));

        cv.setName(request.getName());
        cv.setContent(request.getContent());
        return galleryMapper.cvToCVResponse(cvRepository.save(cv));
    }

    @Override
    public CVImportResponseDTO importCV(byte[] fileContent, String contentType) {
        Map<String, Object> extractedData = aiProvider.parseCVFile(fileContent, contentType);
        return CVImportResponseDTO.builder()
                .extractedData(extractedData)
                .build();
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

        this.processOptimization(jobId, cv, request);

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

        String jdText = jdRepository.findById(jdId)
                .map(JobDescription::getContent)
                .orElseThrow(() -> new RuntimeException("JD not found"));

        return aiProvider.evaluateCV(cv.getContent(), jdText);
    }

    @Override
    public CVFeedbackResponseDTO requestFeedback(UUID cvId, UUID jdId, Gallery gallery) {
        CV cv = cvRepository.findById(cvId)
                .filter(c -> c.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new RuntimeException("CV not found or access denied"));

        String jdText = jdRepository.findById(jdId)
                .map(JobDescription::getContent)
                .orElseThrow(() -> new RuntimeException("JD not found"));

        CVFeedbackResponseDTO feedbackResponse = aiProvider.generateFeedback(cv.getContent(), jdText);

        CVFeedback feedback = CVFeedback.builder()
                .cv(cv)
                .jobDescription(jdRepository.findById(jdId).orElseThrow())
                .overallScore(feedbackResponse.getOverallScore())
                .feedbackJson(Map.of("summary", feedbackResponse.getFeedback().toString()))
                .build();
        feedbackRepository.save(feedback);

        return feedbackResponse;
    }

    @Override
    public CVFeedbackResponseDTO getFeedback(UUID cvId, Gallery gallery) {
        CV cv = cvRepository.findById(cvId).orElseThrow(() -> new RuntimeException("CV not found"));
        return feedbackRepository.findByCv(cv)
                .map(f -> CVFeedbackResponseDTO.builder()
                        .id(f.getId().hashCode() != 0 ? (long) f.getId().hashCode() : 1L)
                        .overallScore(f.getOverallScore())
                        .feedback(CVFeedbackResponseDTO.Feedback.builder()
                                .swot(Map.of("Summary", f.getFeedbackJson().get("summary")))
                                .build())
                        .createdAt(f.getCreatedAt())
                        .build())
                .orElseThrow(() -> new RuntimeException("No feedback available"));
    }

    @Override
    public CVSkillGapResponseDTO analyzeSkillGap(UUID cvId, UUID jdId, Gallery gallery) {
        CV cv = cvRepository.findById(cvId)
                .filter(c -> c.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new RuntimeException("CV not found or access denied"));

        String jdText = jdRepository.findById(jdId)
                .map(JobDescription::getContent)
                .orElseThrow(() -> new RuntimeException("JD not found"));

        return aiProvider.analyzeSkillGap(cv.getContent(), jdText);
    }
}
