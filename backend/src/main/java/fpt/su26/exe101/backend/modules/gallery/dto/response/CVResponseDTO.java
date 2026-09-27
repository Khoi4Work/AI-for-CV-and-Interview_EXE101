package fpt.su26.exe101.backend.modules.gallery.dto.response;

import fpt.su26.exe101.backend.modules.gallery.dto.CVContent;
import fpt.su26.exe101.backend.modules.gallery.entity.CVTemplate;
import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;
import fpt.su26.exe101.backend.modules.gallery.entity.enums.OptimizationState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVResponseDTO {
    private UUID id;
    private Gallery gallery;
    private String name;
    private CVContent content;
    private Integer score;
    private Integer atsScore;
    private OptimizationState optimizationState = OptimizationState.DRAFT;
    private CVTemplate template;
    private String status = "DRAFT";
    private String image;
}
