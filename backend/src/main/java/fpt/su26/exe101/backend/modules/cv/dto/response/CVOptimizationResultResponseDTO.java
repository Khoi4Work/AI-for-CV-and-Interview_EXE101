package fpt.su26.exe101.backend.modules.cv.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    private Integer postOptimizationScore;
    private String scoreNote;

    // Accepted from older AI responses only; never returned to clients or used for scoring.
    @JsonIgnore
    private Integer predictedScore;
}
