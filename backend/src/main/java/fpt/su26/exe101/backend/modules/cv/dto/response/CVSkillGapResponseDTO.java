package fpt.su26.exe101.backend.modules.cv.dto.response;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVSkillGapResponseDTO {
    private List<String> missingSkills;
    private List<String> matchingSkills;
}
