package fpt.su26.exe101.backend.modules.cv.dto.response;

import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
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
