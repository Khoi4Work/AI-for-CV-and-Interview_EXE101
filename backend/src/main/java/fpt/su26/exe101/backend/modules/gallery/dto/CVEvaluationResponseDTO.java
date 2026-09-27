package fpt.su26.exe101.backend.modules.gallery.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVEvaluationResponseDTO {
    private Integer score;
    private Analysis analysis;
    private Integer atsCompatibility;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Analysis {
        private List<String> strengths;
        private List<String> weaknesses;
        private List<String> suggestions;
    }
}
