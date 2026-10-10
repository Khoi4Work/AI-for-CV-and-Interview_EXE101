package fpt.su26.exe101.backend.modules.cv.service.impl;

import com.fasterxml.jackson.annotation.JsonProperty;
import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVEvaluationResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.JDRecommendationResponseDTO;
import fpt.su26.exe101.backend.modules.cv.entity.CV;
import fpt.su26.exe101.backend.modules.cv.repository.CVRepository;
import fpt.su26.exe101.backend.modules.cv.service.AIProviderService;
import fpt.su26.exe101.backend.modules.cv.service.JDRecommendationService;
import fpt.su26.exe101.backend.modules.cv.service.RoleTaxonomyService;
import fpt.su26.exe101.backend.modules.gallery.repository.JobDescriptionRepository;
import fpt.su26.exe101.backend.modules.gallery.entity.enums.JobDescriptionSource;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Slf4j
public class JDRecommendationServiceImpl implements JDRecommendationService {
    private static final int MAX_CANDIDATES = 1000;
    private static final int RECOMMENDATION_LIMIT = 2;
    private static final int ALTERNATIVE_EVALUATION_LIMIT = 5;
    private static final Set<String> SEARCH_STOP_WORDS = Set.of(
            "and", "or", "the", "with", "from", "for", "to", "in", "on", "at", "of", "an", "as",
            "is", "are", "be", "by", "that", "this",
            "và", "hoặc", "của", "cho", "với", "từ", "trong", "các", "những", "là", "đã", "sẽ", "để", "một");

    private final CVRepository cvRepository;
    private final JobDescriptionRepository jdRepository;
    private final AIProviderService aiProvider;
    private final UsageQuotaService quotaService;
    private final RestClient cohereClient = RestClient.builder().baseUrl("https://api.cohere.com").build();
    private final String cohereApiKey;
    private final String rerankModel;
    private final RoleTaxonomyService taxonomy;

    public JDRecommendationServiceImpl(CVRepository cvRepository,
                                       JobDescriptionRepository jdRepository,
                                       AIProviderService aiProvider,
                                       UsageQuotaService quotaService,
                                       @Value("${cohere.api-key:}") String cohereApiKey,
                                       @Value("${cv.jd-recommendations.rerank-model:rerank-v4.0-fast}") String rerankModel,
                                       RoleTaxonomyService taxonomy) {
        this.cvRepository = cvRepository;
        this.jdRepository = jdRepository;
        this.aiProvider = aiProvider;
        this.quotaService = quotaService;
        this.cohereApiKey = cohereApiKey;
        this.rerankModel = rerankModel;
        this.taxonomy = taxonomy;
    }

    @Transactional(readOnly = true)
    @Override
    public List<JDRecommendationResponseDTO> recommend(UUID cvId, UUID galleryId) {
        CV cv = cvRepository.findWithGalleryById(cvId)
                .filter(candidate -> candidate.getGallery().getId().equals(galleryId))
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "CV not found"));
        String targetRole = toExplicitTargetRole(cv.getContent());

        List<Candidate> candidates = new ArrayList<>();
        jdRepository.findBySourceAndActiveTrue(JobDescriptionSource.SYSTEM).stream()
                .map(jd -> new Candidate("SYSTEM", jd.getId(), jd.getTitle(), jd.getCompanyName(), jd.getIndustry(),
                        jd.getExperienceLevel(), jd.getContent()))
                .forEach(candidates::add);
        jdRepository.findByGalleryId(galleryId).stream()
                .filter(jd -> jd.getSource() == JobDescriptionSource.USER && jd.isActive())
                .map(jd -> new Candidate("PRIVATE", jd.getId(), jd.getTitle(), jd.getCompanyName(), null, null, jd.getContent()))
                .forEach(candidates::add);

        if (candidates.isEmpty()) return List.of();
        boolean roleBased = !targetRole.isBlank();
        Set<String> targetCodes = taxonomy.roles(targetRole);
        Set<String> hashes = new HashSet<>();
        List<Candidate> candidatesToRank = candidates.stream()
                .filter(c -> c.content() != null && c.content().trim().split("\\s+").length >= 6)
                .filter(c -> !roleBased || !Collections.disjoint(targetCodes, taxonomy.jobRoles(c.title(), c.content())))
                .filter(c -> hashes.add(CVAnalysisServiceImpl.hash(c.content().trim().replaceAll("\\s+", " "))))
                .limit(MAX_CANDIDATES)
                .toList();
        if (candidatesToRank.isEmpty()) return List.of();
        String query = toCVContext(cv.getContent());
        if (query.isBlank()) return List.of();
        List<ScoredCandidate> ranked = rankWithCohere(query, candidatesToRank, RECOMMENDATION_LIMIT);
        if (ranked == null) ranked = rankByTokenOverlap(query, candidatesToRank).stream()
            .map(c -> roleBased ? new ScoredCandidate(c.candidate(), Math.max(1,c.score())) : c).toList();

        List<JDRecommendationResponseDTO> result = ranked.stream()
                .filter(scored -> roleBased || scored.score() > 0)
                .limit(RECOMMENDATION_LIMIT)
                .map(scored -> JDRecommendationResponseDTO.builder()
                        .source(scored.candidate().source())
                        .id(scored.candidate().id())
                        .title(scored.candidate().title())
                        .companyName(scored.candidate().companyName())
                        .industry(scored.candidate().industry())
                        .experienceLevel(scored.candidate().experienceLevel())
                        .content(scored.candidate().content())
                        .build())
                .toList();
        log.info("[CV JD] CV-based recommendations ranked | cvId={} | galleryId={} | targetRole={} | searchBasis={} | candidateCount={} | resultCount={}",
                cvId, galleryId, targetRole, roleBased ? "cv-role-content" : "cv-evidence", candidatesToRank.size(), result.size());
        return result;
    }

    @Override
    public List<JDRecommendationResponseDTO> recommendHigherScoringOtherRoles(
            UUID cvId, UUID galleryId, UUID currentJdId, int currentScore) {
        CV cv = cvRepository.findWithGalleryById(cvId)
                .filter(candidate -> candidate.getGallery().getId().equals(galleryId))
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "CV not found"));
        String targetRole = toExplicitTargetRole(cv.getContent());
        if (targetRole.isBlank() || currentJdId == null) return List.of();

        List<Candidate> alternatives = new ArrayList<>();
        jdRepository.findBySourceAndActiveTrue(JobDescriptionSource.SYSTEM).stream()
                .filter(jd -> !jd.getId().equals(currentJdId))
                .map(jd -> new Candidate("SYSTEM", jd.getId(), jd.getTitle(), jd.getCompanyName(), jd.getIndustry(),
                        jd.getExperienceLevel(), jd.getContent()))
                .forEach(alternatives::add);
        jdRepository.findByGalleryId(galleryId).stream()
                .filter(jd -> jd.getSource() == JobDescriptionSource.USER && jd.isActive()
                        && !jd.getId().equals(currentJdId))
                .map(jd -> new Candidate("PRIVATE", jd.getId(), jd.getTitle(), jd.getCompanyName(), null, null, jd.getContent()))
                .forEach(alternatives::add);

        List<Candidate> otherRoles = alternatives.stream()
                .filter(candidate -> !sameRole(targetRole, candidate.title()))
                .limit(MAX_CANDIDATES)
                .toList();
        if (otherRoles.isEmpty()) return List.of();

        String cvContext = toCVContext(cv.getContent());
        List<ScoredCandidate> ranked = rankWithCohere(cvContext, otherRoles, ALTERNATIVE_EVALUATION_LIMIT);
        if (ranked == null) ranked = rankByTokenOverlap(cvContext, otherRoles);

        List<EvaluatedCandidate> higherScoring = new ArrayList<>();
        UserPlan plan = quotaService.getCvPlan(cv.getGallery().getAccountId());
        for (ScoredCandidate candidate : ranked.stream().limit(ALTERNATIVE_EVALUATION_LIMIT).toList()) {
            try {
                CVEvaluationResponseDTO evaluation = aiProvider.evaluateCV(
                        cv.getContent(), candidate.candidate().content(), plan);
                if (evaluation.getScore() != null && evaluation.getScore() > currentScore) {
                    higherScoring.add(new EvaluatedCandidate(candidate.candidate(), evaluation.getScore()));
                }
            } catch (RuntimeException exception) {
                log.warn("[CV JD] Alternative evaluation failed | cvId={} | jdId={} | errorType={}",
                        cvId, candidate.candidate().id(), exception.getClass().getSimpleName());
            }
        }

        List<JDRecommendationResponseDTO> result = higherScoring.stream()
                .sorted(Comparator.comparingInt(EvaluatedCandidate::score).reversed())
                .limit(RECOMMENDATION_LIMIT)
                .map(evaluated -> JDRecommendationResponseDTO.builder()
                        .source(evaluated.candidate().source())
                        .id(evaluated.candidate().id())
                        .title(evaluated.candidate().title())
                        .companyName(evaluated.candidate().companyName())
                        .industry(evaluated.candidate().industry())
                        .experienceLevel(evaluated.candidate().experienceLevel())
                        .content(evaluated.candidate().content())
                        .build())
                .toList();
        log.info("[CV JD] Higher-scoring other-role recommendations | cvId={} | currentJdId={} | currentScore={} | evaluatedCount={} | resultCount={}",
                cvId, currentJdId, currentScore, Math.min(ranked.size(), ALTERNATIVE_EVALUATION_LIMIT), result.size());
        return result;
    }

    private List<ScoredCandidate> rankWithCohere(String query, List<Candidate> candidates, int topN) {
        if (cohereApiKey == null || cohereApiKey.isBlank()) return null;
        List<String> documents = candidates.stream().map(Candidate::toDocument).toList();
        try {
            RerankResponse response = cohereClient.post().uri("/v2/rerank")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + cohereApiKey.trim())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new RerankRequest(rerankModel, query, documents, Math.min(topN, documents.size())))
                    .retrieve().body(RerankResponse.class);
            if (response == null || response.results() == null) return null;
            return response.results().stream()
                    .filter(result -> result.index() >= 0 && result.index() < candidates.size())
                    .map(result -> new ScoredCandidate(candidates.get(result.index()),
                            (int) Math.round(Math.max(0, Math.min(1, result.relevanceScore())) * 100)))
                    .toList();
        } catch (RuntimeException exception) {
            log.warn("[CV JD] Cohere rerank unavailable; using local ranking | model={} | candidateCount={} | errorType={}",
                    rerankModel, documents.size(), exception.getClass().getSimpleName());
            return null;
        }
    }

    private List<ScoredCandidate> rankByTokenOverlap(String query, List<Candidate> candidates) {
        Set<String> queryTokens = tokens(query);
        return candidates.stream().map(candidate -> {
            Set<String> jdTokens = tokens(candidate.toDocument());
            long shared = queryTokens.stream().filter(jdTokens::contains).count();
            int score = queryTokens.isEmpty() || jdTokens.isEmpty() ? 0
                    : (int) Math.round(100.0 * shared / (queryTokens.size() + jdTokens.size() - shared));
            return new ScoredCandidate(candidate, score);
        }).sorted(Comparator.comparingInt(ScoredCandidate::score).reversed()).toList();
    }

    private List<ScoredCandidate> rankByRoleOverlap(String targetRole, List<Candidate> candidates) {
        Set<String> roleTokens = roleTokens(targetRole);
        return candidates.stream().map(candidate -> {
            Set<String> jobTokens = roleTokens(candidate.toDocument());
            Set<String> titleTokens = roleTokens(Stream.of(candidate.title(), candidate.industry())
                    .filter(Objects::nonNull).collect(Collectors.joining(" ")));
            long sharedWithContent = roleTokens.stream().filter(jobTokens::contains).count();
            long sharedWithTitle = roleTokens.stream().filter(titleTokens::contains).count();
            double contentCoverage = roleTokens.isEmpty() ? 0 : (double) sharedWithContent / roleTokens.size();
            double titleCoverage = roleTokens.isEmpty() ? 0 : (double) sharedWithTitle / roleTokens.size();
            int score = (int) Math.round(100.0 * (0.75 * contentCoverage + 0.25 * titleCoverage));
            return new ScoredCandidate(candidate, score);
        }).filter(candidate -> candidate.score() >= 50)
                .sorted(Comparator.comparingInt(ScoredCandidate::score).reversed()).toList();
    }

    private String toExplicitTargetRole(CVContent content) {
        if (content == null) return "";
        if (!"EXPLICIT".equals(content.getTargetRoleOrigin())) return "";
        if (content.getProfessionalTitle() != null && !content.getProfessionalTitle().isBlank()) {
            return content.getProfessionalTitle().trim();
        }
        return "";
    }

    private boolean sameRole(String targetRole, String jobTitle) {
        Set<String> targetTokens = roleTokens(targetRole);
        Set<String> jobTokens = roleTokens(jobTitle);
        if (targetTokens.isEmpty() || jobTokens.isEmpty()) return false;

        long shared = targetTokens.stream().filter(jobTokens::contains).count();
        double overlap = (double) shared / Math.max(targetTokens.size(), jobTokens.size());
        return shared > 0 && overlap > 0.5;
    }

    private Set<String> roleTokens(String title) {
        Set<String> normalized = new HashSet<>();
        String canonicalTitle = title.toLowerCase(Locale.ROOT)
                .replaceAll("(?<![\\p{L}])ba(?![\\p{L}])", "business analyst")
                .replace("phân tích nghiệp vụ", "business analyst")
                .replace("phan tich nghiep vu", "business analyst")
                .replace("business analysis", "business analyst");
        for (String token : tokens(canonicalTitle)) {
            switch (token) {
                case "frontend", "front-end", "front" -> normalized.add("frontend");
                case "backend", "back-end", "back" -> normalized.add("backend");
                case "fullstack", "full-stack" -> normalized.add("fullstack");
                case "qa", "qc", "tester", "testing" -> normalized.add("quality");
                case "developer", "engineer", "programmer", "dev" -> normalized.add("devrole");
                case "senior", "junior", "middle", "mid", "fresher", "intern", "lead", "principal",
                     "staff", "associate", "specialist", "expert", "lap", "trinh", "vien", "nhan", "chuyen" -> { }
                default -> normalized.add(token);
            }
        }
        return normalized;
    }

    private String roleKey(String title) {
        return roleTokens(title).stream().sorted().collect(Collectors.joining(" "));
    }

    private Set<String> tokens(String text) {
        return Arrays.stream(text.toLowerCase(Locale.ROOT).split("[^\\p{L}\\p{N}+#.]+"))
                .map(token -> token.replaceAll("\\.+$", ""))
                .filter(token -> token.length() > 1 && !SEARCH_STOP_WORDS.contains(token))
                .collect(Collectors.toSet());
    }

    private String toCVContext(CVContent content) {
        if (content == null) return "";
        List<String> fields = new ArrayList<>();
        add(fields, content.getProfessionalTitle());
        add(fields, content.getSummary());
        if (content.getSkills() != null) content.getSkills().forEach(skill -> { if (skill != null) add(fields, skill.getName()); });
        if (content.getExperiences() != null) content.getExperiences().forEach(experience -> {
            if (experience != null) {
                add(fields, experience.getRole());
                if (experience.getDetails() != null) experience.getDetails().forEach(value -> add(fields, value));
            }
        });
        if (content.getProjects() != null) content.getProjects().forEach(project -> {
            if (project != null) {
                add(fields, project.getName());
                if (project.getDetails() != null) project.getDetails().forEach(value -> add(fields, value));
            }
        });
        String context = String.join("\n", fields);
        return context.substring(0, Math.min(context.length(), 12000));
    }

    private void add(List<String> fields, String value) {
        if (value != null && !value.isBlank()) fields.add(value.trim());
    }

    private record Candidate(String source, UUID id, String title, String companyName, String industry,
                             String experienceLevel, String content) {
        private String toDocument() {
            return Stream.of(title, companyName, industry, experienceLevel, content)
                    .filter(value -> value != null && !value.isBlank()).collect(Collectors.joining("\n"));
        }
    }
    private record ScoredCandidate(Candidate candidate, int score) {}
    private record EvaluatedCandidate(Candidate candidate, int score) {}
    private record RerankRequest(String model, String query, List<String> documents,
                                 @JsonProperty("top_n") int topN) {}
    private record RerankResponse(List<RerankResult> results) {}
    private record RerankResult(int index, @JsonProperty("relevance_score") double relevanceScore) {}
}
