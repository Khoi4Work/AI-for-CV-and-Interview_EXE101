package fpt.su26.exe101.backend.modules.gallery.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVOptimizationJobResponseDTO {
    private String jobId;
    private String status;
    private Integer estimatedTime;
}
