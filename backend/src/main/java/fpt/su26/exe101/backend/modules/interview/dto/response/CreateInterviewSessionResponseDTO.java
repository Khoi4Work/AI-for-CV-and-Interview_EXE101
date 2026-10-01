package fpt.su26.exe101.backend.modules.interview.dto.response;

import fpt.su26.exe101.backend.modules.interview.entity.enums.InterviewType;
import fpt.su26.exe101.backend.modules.interview.entity.enums.ExperienceLevel;
import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateInterviewSessionResponseDTO {
    private UUID id;
    private InterviewType interviewType;
    private Integer durationMinutes;
    private ExperienceLevel experienceLevel;
    private String language;
    private Boolean adaptiveMode;
    private List<InterviewQuestionResponseDTO> questions;
}
