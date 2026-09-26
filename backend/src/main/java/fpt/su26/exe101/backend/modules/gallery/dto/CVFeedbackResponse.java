package fpt.su26.exe101.backend.modules.gallery.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVFeedbackResponse {
    private Long id;
    private Integer overallScore;
    private Feedback feedback;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Feedback {
        private Map<String, Object> swot;
        private Map<String, Object> sectionAnalysis;
    }
}
