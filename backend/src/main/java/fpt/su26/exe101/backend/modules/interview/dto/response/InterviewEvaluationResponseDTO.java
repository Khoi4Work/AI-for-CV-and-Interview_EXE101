package fpt.su26.exe101.backend.modules.interview.dto.response;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewEvaluationResponseDTO {
    private UUID sessionId;
    private Integer overallScore;
    private String summary;
    private List<String> strengths;
    private List<String> improvementAreas;
    private List<String> recommendations;
    private List<CriterionFeedback> criteria;
    private List<QuestionFeedback> questionFeedback;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CriterionFeedback {
        private String criterion;
        private Integer score;
        private String feedback;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionFeedback {
        private UUID questionId;
        private Integer score;
        private String assessment;
        private String improvementSuggestion;
    }
}
