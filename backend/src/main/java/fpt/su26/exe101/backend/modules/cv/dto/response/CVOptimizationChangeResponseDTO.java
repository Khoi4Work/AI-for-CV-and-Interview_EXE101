package fpt.su26.exe101.backend.modules.cv.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVOptimizationChangeResponseDTO {
    private String sectionName;
    private String originalText;
    private String suggestedText;
}
