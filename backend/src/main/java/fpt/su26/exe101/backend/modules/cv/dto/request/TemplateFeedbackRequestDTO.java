package fpt.su26.exe101.backend.modules.cv.dto.request;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateFeedbackRequestDTO {
    private UUID templateId;
    private Integer rating;
    private String comment;
}
