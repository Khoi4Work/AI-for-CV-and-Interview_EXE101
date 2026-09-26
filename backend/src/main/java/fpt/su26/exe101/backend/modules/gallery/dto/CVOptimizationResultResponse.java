package fpt.su26.exe101.backend.modules.gallery.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVOptimizationResultResponse {
    private java.util.Map<String, Object> optimizedContent;
    private String improvementSummary;
    private Integer predictedScore;
}
