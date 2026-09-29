package fpt.su26.exe101.backend.modules.interview.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitInterviewAnswerRequestDTO {
    @NotNull
    private UUID questionId;

    private String answerText;
    private String audioUrl;

    @NotNull
    private Boolean isSkipped;
}
