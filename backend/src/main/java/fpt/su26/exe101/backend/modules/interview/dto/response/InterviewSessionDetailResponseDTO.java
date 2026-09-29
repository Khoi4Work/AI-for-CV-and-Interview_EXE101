package fpt.su26.exe101.backend.modules.interview.dto.response;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewSessionDetailResponseDTO {
    private InterviewSessionResponseDTO sessionInfo;
    private List<InterviewAnswerResponseDTO> answers;
    private InterviewEvaluationResponseDTO evaluation;
}
