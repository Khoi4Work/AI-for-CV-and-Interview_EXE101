package fpt.su26.exe101.backend.modules.cv.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Snapshot;
import fpt.su26.exe101.backend.modules.cv.entity.enums.AnalysisStatus;
import fpt.su26.exe101.backend.modules.cv.entity.enums.AnalysisQuotaStatus;
import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.dto.request.CVAnalysisStartRequestDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVAnalysisAlternativesResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVAnalysisResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVAlternativeRecommendationItemDTO;
import fpt.su26.exe101.backend.modules.cv.entity.CV;
import fpt.su26.exe101.backend.modules.cv.mapper.CVMapper;
import fpt.su26.exe101.backend.modules.cv.entity.CVAlternativeRecommendationJob;
import fpt.su26.exe101.backend.modules.cv.entity.CVAnalysis;
import fpt.su26.exe101.backend.modules.cv.entity.CVAnalysisRequest;
import fpt.su26.exe101.backend.modules.cv.repository.CVAlternativeRecommendationJobRepository;
import fpt.su26.exe101.backend.modules.cv.repository.CVAnalysisRepository;
import fpt.su26.exe101.backend.modules.cv.repository.CVAnalysisRequestRepository;
import fpt.su26.exe101.backend.modules.cv.repository.CVRepository;
import fpt.su26.exe101.backend.modules.cv.service.CVAnalysisQuotaService;
import fpt.su26.exe101.backend.modules.cv.service.CVAnalysisService;
import fpt.su26.exe101.backend.modules.cv.service.RoleTaxonomyService;
import fpt.su26.exe101.backend.modules.gallery.entity.enums.JobDescriptionSource;
import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescription;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescriptionNormalizationMetadata;
import fpt.su26.exe101.backend.modules.gallery.repository.GalleryRepository;
import fpt.su26.exe101.backend.modules.gallery.repository.JobDescriptionRepository;
import fpt.su26.exe101.backend.modules.gallery.service.GalleryService;
import fpt.su26.exe101.backend.modules.gallery.service.JobDescriptionNormalizationService;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

@Service
@RequiredArgsConstructor
public class CVAnalysisServiceImpl implements CVAnalysisService {
    private final CVRepository cvs;
    private final JobDescriptionRepository jds;
    private final GalleryRepository galleries;
    private final CVAnalysisRepository analyses;
    private final CVAnalysisRequestRepository requests;
    private final CVAlternativeRecommendationJobRepository jobs;
    private final GalleryService galleryService;
    private final CVAnalysisQuotaService quota;
    private final RoleTaxonomyService taxonomy;
    private final JobDescriptionNormalizationService normalization;
    private final ObjectMapper mapper;
    private final CVMapper cvMapper;
    private final TransactionTemplate transaction;
    @Value("${cv.analysis.enabled:false}")
    private boolean enabled;

    private void requireEnabled() {
        if (!enabled) throw new ApiException(ErrorCode.SERVICE_UNAVAILABLE,
                "Chức năng đánh giá đang được cập nhật. Vui lòng thử lại sau.");
    }

    @Override
    public CVAnalysisResponseDTO start(UUID cvId, CVAnalysisStartRequestDTO request, String key, Gallery owner) {
        requireEnabled();
        if (request == null || (request.jdId() == null) == (request.jdText() == null || request.jdText().isBlank())
                || key == null || key.isBlank() || key.length() > 160)
            throw new ApiException(ErrorCode.INVALID_INPUT, "Chọn đúng một jdId/jdText và gửi Idempotency-Key.");
        String digest = requestDigest(cvId, request);
        CVAnalysisResponseDTO existing = transaction.execute(tx -> {
            Optional<CVAnalysisRequest> bound = requests.findByGalleryIdAndRequestKey(owner.getId(), key);
            if (bound.isEmpty()) return null;
            if (!bound.get().getDigest().equals(digest))
                throw new ApiException(ErrorCode.DUPLICATE_RESOURCE, "Idempotency-Key đã dùng cho yêu cầu khác.");
            return view(owned(bound.get().getAnalysisId(), owner), true);
        });
        if (existing != null) return existing;
        UUID preparedId;
        if (request.jdId() != null) preparedId = request.jdId();
        else {
            validateJD(request.jdText());
            transaction.executeWithoutResult(tx -> {
                cvs.findWithGalleryById(cvId).filter(c -> c.getGallery().getId().equals(owner.getId()))
                        .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
                if (request.derivedFromJdId() != null) resolve(request.derivedFromJdId(), owner);
            });
            // Title extraction happens before gallery/CV quota locks are acquired.
            preparedId = galleryService.findOrCreateJobDescription(request.jdText(), owner).getId();
        }
        return transaction.execute(tx -> reserve(cvId, request, key, owner, preparedId));
    }

    private CVAnalysisResponseDTO reserve(
            UUID cvId,
            CVAnalysisStartRequestDTO request,
            String key,
            Gallery owner,
            UUID preparedId) {
        // Serialize cache/idempotency reservation for an owner; release before worker/AI.
        galleries.lock(owner.getId()).orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
        CV cv = cvs.findByIdForUpdate(cvId).filter(c -> c.getGallery().getId().equals(owner.getId()))
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
        String digest = requestDigest(cvId, request);
        Optional<CVAnalysisRequest> prior = requests.findByGalleryIdAndRequestKey(owner.getId(), key);
        if (prior.isPresent()) {
            if (!digest.equals(prior.get().getDigest()))
                throw new ApiException(ErrorCode.DUPLICATE_RESOURCE, "Idempotency-Key đã dùng cho yêu cầu khác.");
            return view(owned(prior.get().getAnalysisId(), owner), true);
        }
        JobDescription jd = resolve(preparedId, owner);
        if (request.derivedFromJdId() != null) normalization.normalize(jd, request.derivedFromJdId());
        validateJD(jd.getContent());
        Snapshot snapshot = snapshot(cv, jd);
        String cacheKey = cacheKey(snapshot);
        CVAnalysis analysis = analyses.findByGalleryIdAndCacheKey(owner.getId(), cacheKey).orElse(null);
        boolean reused = analysis != null;
        if (analysis == null) {
            analysis = create(snapshot, owner.getId(), owner.getAccountId(), cacheKey, false);
            quota.consume(owner.getAccountId(), cvId);
            analysis.setQuotaStatus(AnalysisQuotaStatus.RESERVED);
        } else if ((analysis.getStatus() == AnalysisStatus.FAILED || analysis.getStatus() == AnalysisStatus.INSUFFICIENT_EVIDENCE)
                && analysis.getAttempt() < 3) {
            analysis = analyses.lock(analysis.getId()).orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
            quota.consume(owner.getAccountId(), cvId);
            analysis.setQuotaStatus(AnalysisQuotaStatus.RESERVED);
            analysis.setStatus(AnalysisStatus.PENDING);
            analysis.setPhase("QUEUED");
            analysis.setError(null);
            analysis.setInternalAnalysis(false);
        }
        CVAnalysisRequest binding = new CVAnalysisRequest();
        binding.setGalleryId(owner.getId());
        binding.setRequestKey(key);
        binding.setDigest(digest);
        binding.setAnalysisId(analysis.getId());
        requests.save(binding);
        return view(analysis, reused);
    }

    private String requestDigest(UUID cvId, CVAnalysisStartRequestDTO request) {
        return hash(cvId + "|" + Objects.toString(request.jdId(), "") + "|" + Objects.toString(request.jdText(), "").trim() + "|" + Objects.toString(request.derivedFromJdId(), ""));
    }

    public CVAnalysis create(Snapshot snapshot, UUID gallery, UUID account, String key, boolean internal) {
        CVAnalysis a = new CVAnalysis();
        a.setGalleryId(gallery);
        a.setAccountId(account);
        a.setCvId(snapshot.cvId());
        a.setJdId(snapshot.jdId());
        a.setSnapshot(snapshot);
        a.setCacheKey(key);
        a.setInternalAnalysis(internal);
        a.setRubricVersion(AnalysisContract.RUBRIC);
        a.setExtractionVersion(AnalysisContract.EXTRACTION);
        a.setTaxonomyVersion(RoleTaxonomyService.VERSION);
        a.setConfigVersion(AnalysisContract.CONFIG);
        return analyses.saveAndFlush(a);
    }

    @Override
    @Transactional(readOnly = true)
    public CVAnalysisResponseDTO read(UUID id, Gallery owner) {
        return view(owned(id, owner), true);
    }

    private CVAnalysis owned(UUID id, Gallery owner) {
        return analyses.findById(id).filter(a -> a.getGalleryId().equals(owner.getId()))
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    private JobDescription resolve(UUID id, Gallery owner) {
        return jds.findById(id).filter(j -> j.isActive() && (j.getSource() == JobDescriptionSource.SYSTEM
                        || (j.getGallery() != null && j.getGallery().getId().equals(owner.getId()))))
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "JD không tồn tại hoặc không thuộc tài khoản."));
    }

    public Snapshot snapshot(CV cv, JobDescription jd) {
        CVContent content = mapper.convertValue(cv.getContent(), CVContent.class);
        String cvText = readable(mapper.valueToTree(content));
        if (content.getSourceText() != null && !content.getSourceText().isBlank()) cvText = content.getSourceText();
        JobDescriptionNormalizationMetadata metadata = normalization.normalize(jd, null);
        return cvMapper.toAnalysisSnapshot(cv, jd, content, cvText, metadata);
    }

    public Snapshot snapshot(Snapshot source, JobDescription jd) {
        JobDescriptionNormalizationMetadata metadata = normalization.normalize(jd, null);
        return cvMapper.toAnalysisSnapshot(source, jd, metadata);
    }

    private String readable(JsonNode node) {
        List<String> lines = new ArrayList<>();
        node.fields().forEachRemaining(e -> {
            if (Set.of("profilePhoto", "selectedTemplateId", "sourceText", "sourceTruncated", "targetRoleEvidence", "targetRoleOrigin", "targetRoleCode").contains(e.getKey()))
                return;
            if (e.getValue().isValueNode()) {
                if (!e.getValue().isNull()) lines.add(e.getKey() + ": " + e.getValue().asText());
            } else if (e.getValue().isArray())
                e.getValue().forEach(n -> lines.add(e.getKey() + ": " + (n.isObject() ? readable(n) : n.asText())));
            else lines.add(e.getKey() + ": " + readable(e.getValue()));
        });
        return String.join("\n", lines);
    }

    public String cacheKey(Snapshot snapshot) {
        ObjectNode content = mapper.valueToTree(snapshot.cv());
        content.remove(List.of("profilePhoto", "selectedTemplateId"));
        if (content.path("experiences").isArray()) content.path("experiences").forEach(e -> {
            if (e.isObject()) ((ObjectNode) e).remove("id");
        });
        // Tree field ordering comes from the versioned DTO, not arbitrary client JSON ordering.
        return hash(content.toString() + "|" + snapshot.jdText().trim().replaceAll("\\s+", " ") + "|"
                + Objects.toString(snapshot.jdTitle(), "") + "|" + new TreeSet<>(snapshot.roleCodes()) + "|"
                + Objects.toString(snapshot.companyName(), "") + "|" + snapshot.source() + "|"
                + AnalysisContract.RUBRIC + "|" + AnalysisContract.EXTRACTION + "|" + RoleTaxonomyService.VERSION + "|" + AnalysisContract.CONFIG);
    }

    public static String hash(String text) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR, "Không tạo được dấu vết dữ liệu đánh giá.");
        }
    }

    public static void validateJD(String text) {
        if (text == null || text.trim().length() < 80 || text.length() > 50000
                || text.trim().split("\\s+").length < 12)
            throw new ApiException(ErrorCode.INVALID_INPUT, "Hãy bổ sung trách nhiệm và yêu cầu công việc vào JD.");
    }

    public CVAnalysisResponseDTO view(CVAnalysis a, boolean reused) {
        Integer remaining = cvs.findById(a.getCvId()).map(CV::getAiAnalysisRemaining).orElse(null);
        return cvMapper.toAnalysisResponse(a, reused, remaining);
    }

    @Override
    @Transactional
    public CVAnalysisAlternativesResponseDTO startAlternatives(UUID id, Gallery owner) {
        requireEnabled();
        galleries.lock(owner.getId()).orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
        CVAnalysis parent = owned(id, owner);
        if (parent.getStatus() != AnalysisStatus.COMPLETED)
            throw new ApiException(ErrorCode.INVALID_INPUT, "Cần kết quả hoàn tất để gợi ý nghề khác.");
        CVAlternativeRecommendationJob job = jobs.findByAnalysisId(id).orElse(null);
        if (job == null) {
            job = new CVAlternativeRecommendationJob();
            job.setAnalysisId(id);
            if (parent.getSnapshot().roleCodes().isEmpty() || !AnalysisContract.RUBRIC.equals(parent.getRubricVersion())
                    || !AnalysisContract.EXTRACTION.equals(parent.getExtractionVersion())
                    || !RoleTaxonomyService.VERSION.equals(parent.getTaxonomyVersion())
                    || !AnalysisContract.CONFIG.equals(parent.getConfigVersion()))
                job.setStatus("INSUFFICIENT_EVIDENCE");
            else {
                List<JobDescription> candidates = new ArrayList<>(jds.findBySourceAndActiveTrue(JobDescriptionSource.SYSTEM));
                candidates.addAll(jds.findByGalleryId(owner.getId()).stream().filter(JobDescription::isActive).toList());
                Set<String> hashes = new HashSet<>();
                hashes.add(hash(parent.getSnapshot().jdText().trim().replaceAll("\\s+", " ")));
                job.setCandidateIds(candidates.stream().filter(j -> !j.getId().equals(parent.getJdId()))
                        .filter(j -> j.getSource() == JobDescriptionSource.SYSTEM || (j.getGallery() != null && j.getGallery().getId().equals(owner.getId())))
                        .filter(j -> {
                            Set<String> roles = taxonomy.jobRoles(j.getTitle(), j.getContent());
                            return !roles.isEmpty() && Collections.disjoint(roles, parent.getSnapshot().roleCodes());
                        })
                        .filter(j -> j.getContent() != null && j.getContent().length() >= 80)
                        .sorted(Comparator.comparingInt((JobDescription j) -> overlap(parent.getSnapshot().cvText(), j.getContent())).reversed().thenComparing(j -> j.getId().toString()))
                        .filter(j -> hashes.add(hash(j.getContent().trim().replaceAll("\\s+", " ")))).limit(5).map(JobDescription::getId).toList());
                if (job.getCandidateIds().isEmpty()) job.setStatus("COMPLETED");
            }
            jobs.save(job);
        }
        return alternatives(job);
    }

    @Override
    @Transactional(readOnly = true)
    public CVAnalysisAlternativesResponseDTO readAlternatives(UUID id, Gallery owner) {
        owned(id, owner);
        return jobs.findByAnalysisId(id)
                .map(this::alternatives)
                .orElse(new CVAnalysisAlternativesResponseDTO(id, "NOT_STARTED", List.of(), 0, 0));
    }

    private CVAnalysisAlternativesResponseDTO alternatives(CVAlternativeRecommendationJob j) {
        int completed = (int) j.getAnalysisIds().stream().map(analyses::findById).filter(Optional::isPresent)
                .map(Optional::get).filter(a -> a.getStatus() == AnalysisStatus.COMPLETED).count();
        List<CVAlternativeRecommendationItemDTO> items = j.getItems().stream()
                .map(cvMapper::toAlternativeResponse)
                .toList();
        return new CVAnalysisAlternativesResponseDTO(
                j.getAnalysisId(), j.getStatus(), items, completed, j.getFailedCount());
    }

    private int overlap(String a, String b) {
        Set<String> left = new HashSet<>(Arrays.asList(a.toLowerCase(Locale.ROOT).split("[^\\p{L}\\p{N}+#]+")));
        return (int) Arrays.stream(b.toLowerCase(Locale.ROOT).split("[^\\p{L}\\p{N}+#]+")).filter(t -> t.length() > 3 && left.contains(t)).distinct().count();
    }
}
