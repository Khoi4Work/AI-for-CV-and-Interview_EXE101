package fpt.su26.exe101.backend.modules.gallery.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.base.persistence.Prompt;
import fpt.su26.exe101.backend.base.service.AIChatCompletionService;
import fpt.su26.exe101.backend.modules.cv.entity.enums.RequirementGroup;
import fpt.su26.exe101.backend.modules.cv.exception.CVAnalysisValidationException;
import fpt.su26.exe101.backend.modules.cv.service.RoleTaxonomyService;
import fpt.su26.exe101.backend.modules.cv.service.impl.CVAnalysisServiceImpl;
import fpt.su26.exe101.backend.modules.gallery.dto.JobDescriptionRequirementsDTO;
import fpt.su26.exe101.backend.modules.gallery.dto.JobDescriptionRequirementsResultDTO;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescription;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescriptionNormalizationMetadata;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescriptionNormalizationMetadata.JdEvidence;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescriptionNormalizationMetadata.Requirement;
import fpt.su26.exe101.backend.modules.gallery.exception.JobDescriptionRequirementsPendingException;
import fpt.su26.exe101.backend.modules.gallery.repository.JobDescriptionRepository;
import fpt.su26.exe101.backend.modules.gallery.service.JobDescriptionNormalizationService;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

@Service
@RequiredArgsConstructor
public class JobDescriptionNormalizationServiceImpl implements JobDescriptionNormalizationService {
    private static final String VERSION = "jd-extraction-v1";
    private final JobDescriptionRepository jobs;
    private final RoleTaxonomyService taxonomy;
    private final ObjectMapper mapper;
    private final AIChatCompletionService ai;
    private final TransactionTemplate transaction;
    @Value("${cv.analysis.enabled:false}") private boolean enabled;
    private record Claim(JobDescriptionNormalizationMetadata metadata, UUID token, boolean cached) {}

    @Override public int backfillMetadata(int page, int size) {
        if (!enabled) throw new ApiException(ErrorCode.SERVICE_UNAVAILABLE, "Enable CV analysis after applying its manual schema.");
        if (page < 0 || size < 1 || size > 500) throw new ApiException(ErrorCode.INVALID_INPUT, "Invalid backfill page size.");
        org.springframework.data.domain.Page<JobDescription> batch = jobs.findAll(PageRequest.of(page, size, Sort.by("id")));
        for (JobDescription jd : batch) normalize(jd, null);
        return batch.getNumberOfElements();
    }
    @Override public JobDescriptionNormalizationMetadata normalize(JobDescription jd, UUID derived) {
        if (!enabled) return buildMetadata(jd.getTitle(), jd.getContent(), derived);
        return transaction.execute(tx -> normalizeWithin(jobs.lock(jd.getId())
            .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND)), derived));
    }
    private JobDescriptionNormalizationMetadata normalizeWithin(JobDescription jd, UUID derived) {
        JobDescriptionNormalizationMetadata previous = jd.getNormalizationMetadata();
        if (matches(jd, inputHash(jd.getTitle(), jd.getContent()))) {
            if (derived != null && previous.derivedFromJdId() == null) {
                previous = withRequirements(previous, derived, previous.requirements());
                jd.setNormalizationMetadata(previous);
            }
            return previous;
        }
        UUID original = derived != null ? derived : previous == null ? null : previous.derivedFromJdId();
        JobDescriptionNormalizationMetadata metadata = buildMetadata(jd.getTitle(), jd.getContent(), original);
        jd.setNormalizationMetadata(metadata);
        jd.setNormalizationHash(inputHash(jd.getTitle(), jd.getContent()));
        jd.setNormalizationVersion(VERSION);
        jd.setExtractionStatus("IDLE");
        jd.setExtractionLeaseUntil(null);
        jd.setExtractionClaimToken(null);
        return metadata;
    }
    private JobDescriptionNormalizationMetadata buildMetadata(String title, String content, UUID derived) {
        Set<String> roles = taxonomy.jobRoles(title, content);
        String url = null, date = null;
        if (content != null) {
            try {
                com.fasterxml.jackson.databind.JsonNode json = mapper.readTree(content);
                if (json != null && json.isObject()) {
                    String source = json.path("sourceUrl").asText(json.path("source").asText());
                    if (source.startsWith("https://") || source.startsWith("http://")) url = source;
                    if (json.has("referenceDate")) date = json.get("referenceDate").asText();
                }
            } catch (JsonProcessingException ignored) { /* Plain text has no structured source metadata. */ }
        }
        String quality = content == null || content.trim().split("\\s+").length < 12
            ? "INCOMPLETE" : roles.isEmpty() ? "UNRESOLVED" : "READY";
        return new JobDescriptionNormalizationMetadata(roles, quality, url, date, "UNVERIFIED", derived, List.of());
    }
    @Override public JobDescriptionRequirementsResultDTO requirements(UUID jdId, String title, String content) {
        String hash = inputHash(title, content);
        Claim claim = transaction.execute(tx -> {
            JobDescription row = jobs.lock(jdId).orElse(null);
            // Old snapshot inputs must not replace the live JD cache after an edit/delete.
            if (row == null || !hash.equals(inputHash(row.getTitle(), row.getContent())))
                return new Claim(buildMetadata(title, content, null), null, false);
            JobDescriptionNormalizationMetadata metadata = normalizeWithin(row, null);
            if (!metadata.requirements().isEmpty()) return new Claim(metadata, null, true);
            if ("PROCESSING".equals(row.getExtractionStatus()) && row.getExtractionLeaseUntil() != null
                    && row.getExtractionLeaseUntil().isAfter(LocalDateTime.now()))
                throw new JobDescriptionRequirementsPendingException();
            UUID token = UUID.randomUUID();
            row.setExtractionStatus("PROCESSING");
            row.setExtractionLeaseUntil(LocalDateTime.now().plusMinutes(5));
            row.setExtractionClaimToken(token);
            return new Claim(metadata, token, false);
        });
        if (claim == null) throw new ApiException(ErrorCode.UNEXPECTED_ERROR);
        if (claim.cached()) return new JobDescriptionRequirementsResultDTO(claim.metadata(), 0);
        String prompt = Prompt.jdRequirementExtraction(content);
        String error = "";
        int calls = 0;
        for (int attempt = 0; attempt < 2; attempt++) {
            AIChatCompletionService.Completion response;
            try { response = ai.generateJsonWithMetadata(prompt + error, null, 8192, "cv", "jd-requirements"); }
            catch (RuntimeException failure) { finishClaim(jdId, hash, claim.token(), null); throw failure; }
            calls += response.calls();
            JobDescriptionRequirementsDTO extracted;
            try {
                extracted = mapper.readValue(response.content(), JobDescriptionRequirementsDTO.class);
                validateRequirements(extracted, content);
            } catch (JsonProcessingException | CVAnalysisValidationException failure) {
                error = "\nRepair: " + failure.getMessage() + " Return a complete corrected requirements list.";
                continue;
            }
            JobDescriptionNormalizationMetadata metadata = withRequirements(
                    claim.metadata(),
                    claim.metadata().derivedFromJdId(),
                    List.copyOf(extracted.requirements()));
            finishClaim(jdId, hash, claim.token(), metadata);
            return new JobDescriptionRequirementsResultDTO(metadata, calls);
        }
        finishClaim(jdId, hash, claim.token(), null);
        throw new CVAnalysisValidationException("JD chưa có yêu cầu đủ rõ để đánh giá.");
    }
    private void validateRequirements(JobDescriptionRequirementsDTO result, String content) {
        if (result == null || result.requirements() == null || result.requirements().isEmpty() || result.requirements().size() > 80)
            throw new CVAnalysisValidationException("JD không có yêu cầu rõ ràng.");
        Set<String> ids = new HashSet<>();
        for (Requirement r : result.requirements()) {
            if (r == null || r.requirementId() == null || !ids.add(r.requirementId()) || r.group() == null
                    || r.group() == RequirementGroup.CLARITY || r.jdEvidence() == null || !"jd".equals(r.jdEvidence().anchor())
                    || r.description() == null || r.description().trim().length() < 3
                    || !normalize(content).contains(normalize(r.description()))
                    || !normalize(r.description()).equals(normalize(r.jdEvidence().text())))
                throw new CVAnalysisValidationException("Yêu cầu/trích đoạn không có trong JD.");
        }
    }
    private void finishClaim(
            UUID id,
            String hash,
            UUID token,
            JobDescriptionNormalizationMetadata metadata) {
        if (token == null) return;
        transaction.executeWithoutResult(tx -> jobs.lock(id).ifPresent(row -> {
            if (!token.equals(row.getExtractionClaimToken()) || !matches(row, hash)
                    || !hash.equals(inputHash(row.getTitle(), row.getContent()))) return;
            if (metadata != null) row.setNormalizationMetadata(metadata);
            row.setExtractionStatus(metadata == null ? "FAILED" : "READY");
            row.setExtractionLeaseUntil(null);
            row.setExtractionClaimToken(null);
        }));
    }
    private JobDescriptionNormalizationMetadata withRequirements(
            JobDescriptionNormalizationMetadata prior,
            UUID derived,
            List<Requirement> requirements) {
        return new JobDescriptionNormalizationMetadata(
                prior.roleCodes(),
                prior.quality(),
                prior.sourceUrl(),
                prior.referenceDate(),
                prior.verification(),
                derived,
                requirements);
    }
    private boolean matches(JobDescription jd, String hash) {
        return jd.getNormalizationMetadata() != null && hash.equals(jd.getNormalizationHash()) && VERSION.equals(jd.getNormalizationVersion());
    }
    private String inputHash(String title, String text) {
        return CVAnalysisServiceImpl.hash(Objects.toString(title, "") + "|" + Objects.toString(text, ""));
    }
    private String normalize(String text) { return Objects.toString(text, "").replaceAll("\\s+", " ").trim(); }
}
