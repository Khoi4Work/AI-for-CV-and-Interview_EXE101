package fpt.su26.exe101.backend.modules.auth.dto.request;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequestDTO {
    private String bio;
    private String careerGoal;
    private String experienceLevel;
    private String industry;
    private String companySize;
}
