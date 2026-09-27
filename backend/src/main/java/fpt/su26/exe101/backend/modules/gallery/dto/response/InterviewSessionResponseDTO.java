package fpt.su26.exe101.backend.modules.gallery.dto.response;

import lombok.*;
import java.util.UUID;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewSessionResponseDTO {
    private UUID id;
    private UUID cvId;
    private UUID jdId;
    private String interviewType;
    private Integer durationMinutes;
    private String candidateExperienceLevel;
    private Integer overallScore;
    private Integer cultureFitScore;
    private Map<String, Object> feedbackJson;
    private LocalDateTime sessionDate;
}
