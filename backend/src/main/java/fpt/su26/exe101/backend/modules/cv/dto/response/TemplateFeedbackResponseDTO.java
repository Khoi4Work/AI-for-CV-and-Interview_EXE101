package fpt.su26.exe101.backend.modules.cv.dto.response;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateFeedbackResponseDTO {
    private UUID id;
    private String templateId;
    private Integer rating;
    private String comment;
}
