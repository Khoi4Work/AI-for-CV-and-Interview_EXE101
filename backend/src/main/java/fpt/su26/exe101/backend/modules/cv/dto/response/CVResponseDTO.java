package fpt.su26.exe101.backend.modules.cv.dto.response;

import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.entity.enums.OptimizationState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVResponseDTO {
    private UUID id;
    private UUID galleryId;
    private String name;
    private CVContent content;
    private Integer score;
    private Integer atsScore;
    @Builder.Default
    private OptimizationState optimizationState = OptimizationState.DRAFT;
    private CVTemplateResponseDTO template;
    @Builder.Default
    private String status = "DRAFT";
    private String image;
    private Integer aiAnalysisLimit;
    private Integer aiAnalysisRemaining;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
