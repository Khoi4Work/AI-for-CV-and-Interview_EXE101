package fpt.su26.exe101.backend.modules.gallery.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVOptimizationResultResponseDTO {
    private CVContent optimizedContent;
    private String improvementSummary;
    private Integer predictedScore;
}
