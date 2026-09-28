package fpt.su26.exe101.backend.modules.interview.dto.response;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewAnswerResponseDTO {
    private UUID id;
    private UUID sessionId;
    private UUID questionId;
    private String answerText;
    private String audioUrl;
    private Boolean isSkipped;
}
