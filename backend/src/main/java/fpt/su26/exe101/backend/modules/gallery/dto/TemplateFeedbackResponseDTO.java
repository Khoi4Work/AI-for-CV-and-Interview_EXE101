package fpt.su26.exe101.backend.modules.gallery.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateFeedbackResponseDTO {
    private UUID id;
    private UUID templateId;
    private Integer rating;
    private String comment;
}
