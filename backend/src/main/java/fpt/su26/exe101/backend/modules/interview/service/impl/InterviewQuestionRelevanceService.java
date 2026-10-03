package fpt.su26.exe101.backend.modules.interview.service.impl;

import com.fasterxml.jackson.annotation.JsonProperty;
import fpt.su26.exe101.backend.modules.interview.entity.InterviewQuestion;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
@Slf4j
public class InterviewQuestionRelevanceService {
    private static final int MAX_RERANK_DOCUMENTS = 1000;

    private final RestClient cohereClient;
    private final String apiKey;
    private final String model;
    private final double minimumRelevance;

    public InterviewQuestionRelevanceService(
            @Value("${cohere.api-key:}") String apiKey,
            @Value("${interview.questions.rerank-model:rerank-v4.0-fast}") String model,
            @Value("${interview.questions.minimum-relevance:0.15}") double minimumRelevance) {
        this.cohereClient = RestClient.builder().baseUrl("https://api.cohere.com").build();
        this.apiKey = apiKey;
        this.model = model;
        this.minimumRelevance = minimumRelevance;
    }

    public List<InterviewQuestion> findRelevantQuestions(List<InterviewQuestion> candidates,
                                                          String cvContext, int limit) {
        if (candidates.isEmpty() || cvContext == null || cvContext.isBlank() || limit <= 0 || apiKey.isBlank()) {
            if (apiKey.isBlank()) {
                log.warn("[INTERVIEW QUESTIONS] Cohere rerank skipped because COHERE_API_KEY is not configured");
            }
            return List.of();
        }

        List<InterviewQuestion> boundedCandidates = candidates.stream()
                .limit(MAX_RERANK_DOCUMENTS)
                .toList();
        List<String> documents = boundedCandidates.stream()
                .map(question -> "Question: " + question.getQuestionText()
                        + "\nCategory: " + nullToEmpty(question.getCategory())
                        + "\nCompetency: " + nullToEmpty(question.getCompetency()))
                .toList();

        try {
            RerankResponse response = cohereClient.post()
                    .uri("/v2/rerank")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey.trim())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new RerankRequest(model, cvContext, documents, documents.size()))
                    .retrieve()
                    .body(RerankResponse.class);

            if (response == null || response.results() == null) {
                log.warn("[INTERVIEW QUESTIONS] Cohere rerank returned no results | candidateCount={}", documents.size());
                return List.of();
            }

            List<InterviewQuestion> relevant = response.results().stream()
                    .filter(result -> result.index() >= 0 && result.index() < boundedCandidates.size())
                    .filter(result -> result.relevanceScore() >= minimumRelevance)
                    .limit(limit)
                    .map(result -> boundedCandidates.get(result.index()))
                    .toList();
            log.info("[INTERVIEW QUESTIONS] Cohere rerank completed | model={} | candidateCount={} | relevantCount={} | minimumRelevance={}",
                    model, documents.size(), relevant.size(), minimumRelevance);
            return relevant;
        } catch (RuntimeException exception) {
            log.warn("[INTERVIEW QUESTIONS] Cohere rerank unavailable; generating questions for the remaining slots | model={} | candidateCount={} | errorType={}",
                    model, documents.size(), exception.getClass().getSimpleName());
            return List.of();
        }
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private record RerankRequest(String model, String query, List<String> documents,
                                 @JsonProperty("top_n") int topN) {}

    private record RerankResponse(List<RerankResult> results) {}

    private record RerankResult(int index,
                                @JsonProperty("relevance_score") double relevanceScore) {}
}
