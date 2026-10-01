package fpt.su26.exe101.backend.modules.interview.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewQuestionGenerationDTO {
    private List<QuestionDraft> questions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionDraft {
        private String text;
        private String category;
        private String competency;
        private String sampleAnswer;
        private Map<String, Object> gradingCriteria;
    }
}
