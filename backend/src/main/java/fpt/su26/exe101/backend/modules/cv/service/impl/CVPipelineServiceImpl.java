package fpt.su26.exe101.backend.modules.cv.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.security.NoSuchAlgorithmException;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.dto.response.*;
import fpt.su26.exe101.backend.modules.cv.entity.CV;
import fpt.su26.exe101.backend.modules.cv.entity.CVTemplate;
import fpt.su26.exe101.backend.modules.cv.repository.CVTemplateRepository;
import fpt.su26.exe101.backend.modules.cv.policy.TemplateAccessPolicy;
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
import fpt.su26.exe101.backend.modules.cv.service.CVAnalysisService;
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
import fpt.su26.exe101.backend.modules.cv.service.RoleTaxonomyService;

@Service
@RequiredArgsConstructor
@Slf4j
public class CVPipelineServiceImpl implements CVPipelineService {

    private final CVRepository cvRepository;
    private final CVTemplateRepository templateRepository;
    private final CVFeedbackRepository feedbackRepository;
    private final CVOptimizationLogRepository logRepository;
    private final CVOptimizationJobRepository jobRepository;
    private final GalleryService galleryService;
    private final UsageQuotaService quotaService;
    private final CVAnalysisService cvAnalysisService;
    private final RoleTaxonomyService roleTaxonomy;
    private final AIProviderService aiProvider;
    private final CVMapper cvMapper;
    private final CVFeedbackMapper feedbackMapper;
    private final ObjectMapper objectMapper;
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
        normalizeLanguageSkills(request.getContent());
        validateDraft(request.getName(), request.getContent());
        request.getContent().setSourceText(null);
        request.getContent().setSourceTruncated(false);
        declaredRole(request.getContent());
        CVTemplate template = resolveTemplate(request.getTemplateId(), request.getContent(), null, gallery);
        UsageQuotaService.CvCreationQuota creationQuota = quotaService.consumeCvCreation(gallery.getAccountId());
        CV cv = CV.builder()
                .name(request.getName().trim())
                .template(template)
                .content(request.getContent())
                .gallery(gallery)
                .optimizationState(OptimizationState.DRAFT)
                .status("DRAFT")
                .aiAnalysisLimit(creationQuota.aiAnalysisLimit())
                .aiAnalysisRemaining(creationQuota.aiAnalysisRemaining())
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

        normalizeLanguageSkills(request.getContent());
        validateDraft(request.getName(), request.getContent());
        CVTemplate template = resolveTemplate(request.getTemplateId(), request.getContent(), cv.getTemplate(), gallery);
        cv.setName(request.getName().trim());
        cv.setTemplate(template);
        if (!comparableContent(cv.getContent()).equals(comparableContent(request.getContent()))) {
            // Edited content replaces parser text. Cosmetic edits keep the original evidence/cache.
            request.getContent().setSourceText(null);
            request.getContent().setSourceTruncated(false);
            declaredRole(request.getContent());
        } else {
            request.getContent().setSourceText(cv.getContent().getSourceText());
            request.getContent().setSourceTruncated(cv.getContent().getSourceTruncated());
            request.getContent().setTargetRoleCode(cv.getContent().getTargetRoleCode());
            request.getContent().setTargetRoleOrigin(cv.getContent().getTargetRoleOrigin());
            request.getContent().setTargetRoleEvidence(cv.getContent().getTargetRoleEvidence());
        }
        cv.setContent(request.getContent());
        cvRepository.save(cv);
        return cvMapper.cvToCVResponse(cv);
    }

    private void validateDraft(String name, CVContent content) {
        if (name == null || name.isBlank() || name.trim().length() > 100 || content == null) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Tên CV phải có từ 1 đến 100 ký tự và nội dung không được trống.");
        }
    }

    private void declaredRole(CVContent content) {
        String title = content.getProfessionalTitle();
        content.setTargetRoleOrigin(title == null || title.isBlank() ? "NONE" : "EXPLICIT");
        content.setTargetRoleEvidence(title == null || title.isBlank() ? null : title);
        Set<String> roles = roleTaxonomy.roles(title);
        content.setTargetRoleCode(roles.size() == 1 ? roles.iterator().next() : null);
    }
    private String comparableContent(CVContent content) {
        ObjectNode tree = objectMapper.valueToTree(content);
        tree.remove(List.of("profilePhoto","selectedTemplateId","sourceText","sourceTruncated","targetRoleCode","targetRoleOrigin","targetRoleEvidence"));
        if(tree.path("experiences").isArray()) tree.path("experiences").forEach(e->{if(e.isObject())((com.fasterxml.jackson.databind.node.ObjectNode)e).remove("id");});
        return tree.toString();
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
            if (normalizeLanguageSkills(cv.getContent())) {
                cvRepository.save(cv);
            }
            log.info("[CV] Import completed | cvId={} | galleryId={} | duplicate=true",
                    cv.getId(), gallery.getId());
            return CVImportResponseDTO.builder().cvId(cv.getId()).cvName(cv.getName())
                    .sourceHash(sourceHash).duplicate(true)
                    .extractedData(cv.getContent()).build();
        }
        CVImportModelResponseDTO parsed = aiProvider.parseCVFile(fileContent, contentType);
        CVContent extractedData = parsed == null ? null : parsed.getExtractedData();
        if (parsed == null || !Boolean.TRUE.equals(parsed.getIsCV()) || extractedData == null) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Tệp tải lên không được nhận diện là CV hợp lệ.");
        }
        normalizeLanguageSkills(extractedData);
        if (!hasCVContent(extractedData)) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "CV không có đủ thông tin cá nhân, học vấn hoặc kinh nghiệm để nhập.");
        }
        String cvName = filename == null || filename.isBlank() ? "Imported CV" : filename;
        if (cvName.length() > 100) cvName = cvName.substring(0, 100);
        int analysisLimit = quotaService.getCvAiAnalysisLimit(gallery.getAccountId());
        CV draft = CV.builder().name(cvName).content(extractedData).gallery(gallery)
                .sourceHash(sourceHash).optimizationState(OptimizationState.DRAFT).status("DRAFT")
                .aiAnalysisLimit(analysisLimit)
                .aiAnalysisRemaining(analysisLimit).build();
        cvRepository.save(draft);
        log.info("[CV] Import completed | cvId={} | galleryId={} | duplicate=false",
                draft.getId(), gallery.getId());
        return CVImportResponseDTO.builder()
                .extractedData(extractedData)
                .cvId(draft.getId())
                .cvName(draft.getName())
                .sourceHash(sourceHash)
                .duplicate(false)
                .build();
    }

    @Override
    @Transactional
    public CVContent extractCV(byte[] fileContent, String contentType, Gallery gallery) {
        String sourceHash = sha256(fileContent);
        Optional<CV> existing = cvRepository.findByGalleryIdAndSourceHash(gallery.getId(), sourceHash);
        if (existing.isPresent()) {
            CV existingCV = existing.get();
            if (normalizeLanguageSkills(existingCV.getContent())) {
                cvRepository.save(existingCV);
            }
            log.info("[CV] Reused saved CV content for builder import | cvId={} | galleryId={}",
                    existingCV.getId(), gallery.getId());
            return existingCV.getContent();
        }

        CVImportModelResponseDTO parsed = aiProvider.parseCVFile(fileContent, contentType);
        CVContent extractedData = parsed == null ? null : parsed.getExtractedData();
        if (parsed == null || !Boolean.TRUE.equals(parsed.getIsCV()) || extractedData == null) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Tệp tải lên không được nhận diện là CV hợp lệ.");
        }
        normalizeLanguageSkills(extractedData);
        if (!hasCVContent(extractedData)) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "CV không có đủ thông tin cá nhân, học vấn hoặc kinh nghiệm để điền.");
        }
        return extractedData;
    }

    static boolean normalizeLanguageSkills(CVContent content) {
        if (content == null || content.getSkills() == null || content.getSkills().isEmpty()
                || content.getLanguages() == null || content.getLanguages().isEmpty()) {
            return false;
        }

        Set<String> languageNames = new HashSet<>();
        for (CVContent.Language language : content.getLanguages()) {
            if (language != null && language.getName() != null && !language.getName().isBlank()) {
                languageNames.add(normalizeLanguageName(language.getName()));
            }
        }
        if (languageNames.isEmpty()) {
            return false;
        }

        return content.getSkills().removeIf(skill -> skill != null && skill.getName() != null && !skill.getName().isBlank()
                && languageNames.contains(normalizeLanguageName(skill.getName())));
    }

    private static String normalizeLanguageName(String value) {
        return value.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
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
        } catch (NoSuchAlgorithmException e) {
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR, "Không tạo được dấu vết tệp CV.");
        }
    }

    private JobDescription findOrCreateJD(String jdText, Gallery gallery) {
        return galleryService.findOrCreateJobDescription(jdText, gallery);
    }

    @Transactional
    @Override
    public CVOptimizationJobResponseDTO startOptimization(UUID cvId, CVOptimizationRequestDTO request, Gallery gallery) {
        requirePlan(gallery.getAccountId(), UserPlan.ENHANCE);
        boolean hasJdId = request != null && request.getJdId() != null;
        boolean hasJdText = request != null && hasText(request.getJdText());
        if (hasJdId == hasJdText) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Chọn đúng một JD để tối ưu CV.");
        }
        CV cv = cvRepository.findById(cvId)
                .filter(c -> c.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));

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
            log.error("[CV OPTIMIZATION] Job record not found | cvId={} | galleryId={} | jobId={}",
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

            JobDescription jd = request.getJdId() != null
                    ? galleryService.findJobDescription(request.getJdId(), cv.getGallery())
                    : findOrCreateJD(request.getJdText(), cv.getGallery());

            CVOptimizationResultResponseDTO result = aiProvider.optimizeCV(cv.getContent(), jd.getContent()).join();
            if (result.getOptimizedContent() == null) {
                throw new ApiException(ErrorCode.INVALID_INPUT, "AI chưa tạo được nội dung CV hợp lệ.");
            }
            // The uploaded parser text describes the old CV. Re-evaluate the proposed structured content.
            result.getOptimizedContent().setSourceText(null);
            result.getOptimizedContent().setSourceTruncated(false);
            try {
                result.setPostOptimizationScore(cvAnalysisService.scoreOptimizedContent(
                        cv, result.getOptimizedContent(), jd));
                result.setScoreNote("Điểm được tính lại theo cùng rubric trên CV đề xuất và JD đã chọn.");
            } catch (RuntimeException scoringException) {
                log.warn("[CV OPTIMIZATION] Could not score proposed content | cvId={} | jobId={}", cvId, jobId, scoringException);
                result.setPostOptimizationScore(null);
                result.setScoreNote("Chưa thể tính điểm đáng tin cậy cho bản đề xuất này. Bạn vẫn có thể xem và chỉnh sửa nội dung CV.");
            }
            result.setPredictedScore(null);

            job.setProgress(70);
            jobRepository.save(job);

            job.setResultSnapshot(objectMapper.writeValueAsString(result));

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
            job.setStatus("FAILED");
            job.setErrorMessage(e.getMessage());
            jobRepository.save(job);
        }
    }

    @Override
    public CVOptimizationStatusResponseDTO getOptimizationStatus(String jobId, Gallery gallery) {
        CVOptimizationJob job = findOwnedOptimizationJob(jobId, gallery);

        return CVOptimizationStatusResponseDTO.builder()
                .jobId(jobId)
                .status(job.getStatus())
                .progress(job.getProgress())
                .build();
    }

    @Override
    public CVOptimizationResultResponseDTO getOptimizationResult(String jobId, Gallery gallery) {
        CVOptimizationJob job = findOwnedOptimizationJob(jobId, gallery);

        if (!"COMPLETED".equals(job.getStatus())) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Kết quả tối ưu chưa sẵn sàng.");
        }

        if (hasText(job.getResultSnapshot())) {
            try {
                return objectMapper.readValue(job.getResultSnapshot(), CVOptimizationResultResponseDTO.class);
            } catch (com.fasterxml.jackson.core.JsonProcessingException exception) {
                throw new ApiException(ErrorCode.UNEXPECTED_ERROR, "Không đọc được kết quả tối ưu CV.");
            }
        }

        // Older completed jobs predate result snapshots. Keep them readable during rollout.
        CV cv = cvRepository.findById(job.getCvId())
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
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
                // Old rows stored an AI estimate here; do not present it as a rubric score.
                .postOptimizationScore(null)
                .scoreNote("Phiên tối ưu cũ chưa lưu điểm theo rubric. Hãy đánh giá lại CV đã lưu để xem điểm hiện tại.")
                .build();
    }

    private CVOptimizationJob findOwnedOptimizationJob(String jobId, Gallery gallery) {
        CVOptimizationJob job = jobRepository.findByJobId(jobId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
        cvRepository.findWithGalleryById(job.getCvId())
                .filter(cv -> cv.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
        return job;
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
                        "Feedback not found for this CV and job description."));
    }

    private void requirePlan(UUID accountId, UserPlan minimumPlan) {
        if (quotaService.getCvPlan(accountId).ordinal() < minimumPlan.ordinal()) {
            throw new ApiException(ErrorCode.QUOTA_EXCEEDED, "This CV feature requires the " + minimumPlan + " plan.");
        }
    }
}
