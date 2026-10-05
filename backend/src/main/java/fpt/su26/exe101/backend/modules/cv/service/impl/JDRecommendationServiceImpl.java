package fpt.su26.exe101.backend.modules.cv.service.impl;

import com.fasterxml.jackson.annotation.JsonProperty;
import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.dto.response.JDRecommendationResponseDTO;
import fpt.su26.exe101.backend.modules.cv.entity.CV;
import fpt.su26.exe101.backend.modules.cv.repository.CVRepository;
import fpt.su26.exe101.backend.modules.cv.service.JDRecommendationService;
import fpt.su26.exe101.backend.modules.gallery.repository.JobDescriptionRepository;
import fpt.su26.exe101.backend.modules.gallery.entity.enums.JobDescriptionSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Slf4j
public class JDRecommendationServiceImpl implements JDRecommendationService {
    private static final int MAX_CANDIDATES = 1000;
    private static final int RECOMMENDATION_LIMIT = 5;

    private final CVRepository cvRepository;
    private final JobDescriptionRepository jdRepository;
    private final RestClient cohereClient = RestClient.builder().baseUrl("https://api.cohere.com").build();
    private final String cohereApiKey;
    private final String rerankModel;
    private final int minimumScore;

    public JDRecommendationServiceImpl(CVRepository cvRepository,
                                       JobDescriptionRepository jdRepository,
                                       @Value("${cohere.api-key:}") String cohereApiKey,
                                       @Value("${cv.jd-recommendations.rerank-model:rerank-v4.0-fast}") String rerankModel,
                                       @Value("${cv.jd-recommendations.minimum-score:10}") int minimumScore) {
        this.cvRepository = cvRepository;
        this.jdRepository = jdRepository;
        this.cohereApiKey = cohereApiKey;
        this.rerankModel = rerankModel;
        this.minimumScore = minimumScore;
    }

    @Transactional(readOnly = true)
    @Override
    public List<JDRecommendationResponseDTO> recommend(UUID cvId, UUID galleryId) {
        CV cv = cvRepository.findWithGalleryById(cvId)
                .filter(candidate -> candidate.getGallery().getId().equals(galleryId))
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "CV not found"));
        String query = toCVContext(cv.getContent());
        if (query.isBlank()) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "CV does not contain enough information to recommend jobs.");
        }

        List<Candidate> candidates = new ArrayList<>();
        jdRepository.findBySourceAndActiveTrue(JobDescriptionSource.SYSTEM).stream()
                .map(jd -> new Candidate("SYSTEM", jd.getId(), jd.getTitle(), jd.getCompanyName(), jd.getIndustry(),
                        jd.getExperienceLevel(), jd.getContent()))
                .forEach(candidates::add);
        jdRepository.findByGalleryId(galleryId).stream()
                .filter(jd -> jd.getSource() == JobDescriptionSource.USER)
                .map(jd -> new Candidate("PRIVATE", jd.getId(), jd.getTitle(), jd.getCompanyName(), null, null, jd.getContent()))
                .forEach(candidates::add);

        if (candidates.isEmpty()) return List.of();
        List<Candidate> bounded = candidates.stream().limit(MAX_CANDIDATES).toList();
        List<ScoredCandidate> ranked = rankWithCohere(query, bounded);
        if (ranked == null) ranked = rankByTokenOverlap(query, bounded);

        List<JDRecommendationResponseDTO> result = ranked.stream().filter(scored -> scored.score() >= minimumScore)
                .limit(RECOMMENDATION_LIMIT)
                .map(scored -> JDRecommendationResponseDTO.builder()
                        .source(scored.candidate().source())
                        .id(scored.candidate().id())
                        .title(scored.candidate().title())
                        .companyName(scored.candidate().companyName())
                        .industry(scored.candidate().industry())
                        .experienceLevel(scored.candidate().experienceLevel())
                        .content(scored.candidate().content())
                        .relevanceScore(scored.score())
                        .build())
                .toList();
        log.info("[CV JD] Recommendations ranked | cvId={} | galleryId={} | candidateCount={} | resultCount={} | provider={}",
                cvId, galleryId, bounded.size(), result.size(), cohereApiKey.isBlank() ? "local-fallback" : "cohere");
        return result;
    }

    private List<ScoredCandidate> rankWithCohere(String query, List<Candidate> candidates) {
        if (cohereApiKey == null || cohereApiKey.isBlank()) return null;
        List<String> documents = candidates.stream().map(Candidate::toDocument).toList();
        try {
            RerankResponse response = cohereClient.post().uri("/v2/rerank")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + cohereApiKey.trim())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new RerankRequest(rerankModel, query, documents, Math.min(RECOMMENDATION_LIMIT, documents.size())))
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

    private Set<String> tokens(String text) {
        return Arrays.stream(text.toLowerCase(Locale.ROOT).split("[^\\p{L}\\p{N}+#.]+")).filter(token -> token.length() > 1)
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
    private record RerankRequest(String model, String query, List<String> documents,
                                 @JsonProperty("top_n") int topN) {}
    private record RerankResponse(List<RerankResult> results) {}
    private record RerankResult(int index, @JsonProperty("relevance_score") double relevanceScore) {}
}
