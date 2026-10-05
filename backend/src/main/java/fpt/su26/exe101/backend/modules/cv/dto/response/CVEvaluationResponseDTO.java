package fpt.su26.exe101.backend.modules.cv.dto.response;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVEvaluationResponseDTO {
    private UUID jdId;
    private Integer score;
    private Analysis analysis;
    private Integer atsCompatibility;
    private Integer cvAiAnalysisLimit;
    private Integer cvAiAnalysisRemaining;

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
