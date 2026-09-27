package fpt.su26.exe101.backend.modules.gallery.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVFeedbackResponseDTO {
    private UUID id;
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
