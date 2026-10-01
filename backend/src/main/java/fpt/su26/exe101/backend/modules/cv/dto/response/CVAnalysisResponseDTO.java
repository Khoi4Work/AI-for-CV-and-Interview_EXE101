package fpt.su26.exe101.backend.modules.cv.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CVAnalysisResponseDTO {
    private CVEvaluationResponseDTO evaluation;
    private CVSkillGapResponseDTO skillGap;
    private CVFeedbackResponseDTO feedback;
}
