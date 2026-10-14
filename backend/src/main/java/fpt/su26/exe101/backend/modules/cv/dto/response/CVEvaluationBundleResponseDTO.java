package fpt.su26.exe101.backend.modules.cv.dto.response;

import lombok.Builder;
import lombok.Getter;

/** Legacy synchronous evaluation, skill-gap, and feedback bundle. */
@Getter
@Builder
public class CVEvaluationBundleResponseDTO {
    private final CVEvaluationResponseDTO evaluation;
    private final CVSkillGapResponseDTO skillGap;
    private final CVFeedbackResponseDTO feedback;
}
