package fpt.su26.exe101.backend.modules.cv.dto.response;

import fpt.su26.exe101.backend.modules.cv.dto.CVFeedbackContent;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVFeedbackResponseDTO {
    private UUID id;
    private Integer overallScore;
    private CVFeedbackContent feedback;
    private LocalDateTime createdAt;

}
