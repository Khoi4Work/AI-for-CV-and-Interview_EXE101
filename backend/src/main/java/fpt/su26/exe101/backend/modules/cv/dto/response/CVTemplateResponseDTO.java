package fpt.su26.exe101.backend.modules.cv.dto.response;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVTemplateResponseDTO {
    private String id;
    private String name;
    private String category;
    private String subtitle;
    private String style;
    private String type;
    private String badgeText;
    private String badgeTheme;
    private String description;
    private Double rating;
    private Integer downloads;
    private String previewImage;
}
