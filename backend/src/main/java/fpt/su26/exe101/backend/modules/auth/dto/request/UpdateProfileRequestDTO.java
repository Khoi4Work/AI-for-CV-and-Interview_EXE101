package fpt.su26.exe101.backend.modules.auth.dto.request;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequestDTO {
    private String fullName;
    private String bio;
    private String careerGoal;
    private String experienceLevel;
    private String industry;
    private String companySize;
    private String phone;
    private String location;
    private String profession;
    private String linkedin;
    private String portfolio;
    private String github;
}
