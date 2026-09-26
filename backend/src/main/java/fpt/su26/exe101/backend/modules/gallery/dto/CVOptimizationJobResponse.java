package fpt.su26.exe101.backend.modules.gallery.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVOptimizationJobResponse {
    private String jobId;
    private String status;
    private Integer estimatedTime;
}
