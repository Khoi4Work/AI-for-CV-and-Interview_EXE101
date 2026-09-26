package fpt.su26.exe101.backend.modules.gallery.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVEvaluationResponse {
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
