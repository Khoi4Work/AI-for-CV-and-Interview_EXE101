package fpt.su26.exe101.backend.modules.gallery.dto.response;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVTemplateResponseDTO {
    private UUID id;
    private String name;
    private String category;
    private String previewImage;
}
