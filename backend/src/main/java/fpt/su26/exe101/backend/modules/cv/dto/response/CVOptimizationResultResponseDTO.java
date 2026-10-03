package fpt.su26.exe101.backend.modules.cv.dto.response;

import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVOptimizationResultResponseDTO {
    private CVContent optimizedContent;
    private String improvementSummary;
    @Builder.Default
    private List<CVOptimizationChangeResponseDTO> improvements = List.of();
    private Integer predictedScore;
}
