package fpt.su26.exe101.backend.modules.cv.dto.response;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JDRecommendationResponseDTO {
    private String source;
    private UUID id;
    private String title;
    private String companyName;
    private String industry;
    private String experienceLevel;
    private String content;
    private Integer relevanceScore;
}
