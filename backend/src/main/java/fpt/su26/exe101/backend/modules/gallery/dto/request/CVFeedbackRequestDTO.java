package fpt.su26.exe101.backend.modules.gallery.dto.request;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVFeedbackRequestDTO {
    private UUID jdId;
    private String jdText;
}
