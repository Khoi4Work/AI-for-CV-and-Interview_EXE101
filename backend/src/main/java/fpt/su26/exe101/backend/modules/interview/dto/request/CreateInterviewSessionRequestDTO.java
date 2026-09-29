package fpt.su26.exe101.backend.modules.interview.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateInterviewSessionRequestDTO {
    @NotBlank
    private String interviewType;

    @NotNull
    private Integer durationMinutes;

    @NotBlank
    private String experienceLevel;

    @Builder.Default
    private String language = "vi";

    private UUID cvId;
    private UUID jdId;
    private String jdText;

    @Builder.Default
    private Boolean adaptiveMode = false;
}
