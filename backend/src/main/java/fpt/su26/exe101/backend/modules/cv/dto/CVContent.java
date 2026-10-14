package fpt.su26.exe101.backend.modules.cv.dto;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonFormat;
import fpt.su26.exe101.backend.modules.cv.entity.enums.SkillLevel;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = false)
public class CVContent {
    private PersonalInfo personalInfo;
    private String profilePhoto;
    private String professionalTitle;
    private String targetRoleCode;
    private String targetRoleOrigin;
    private String targetRoleEvidence;
    private String sourceText;
    private Boolean sourceTruncated;
    private String summary;
    @Builder.Default
    private List<Experience> experiences = new ArrayList<>();
    @Builder.Default private List<Education> education = new ArrayList<>();
    @Builder.Default
    private List<Skill> skills = new ArrayList<>();
    @Builder.Default private List<Project> projects = new ArrayList<>();
    @Builder.Default private List<Certificate> certificates = new ArrayList<>();
    @Builder.Default private List<Language> languages = new ArrayList<>();
    @Builder.Default private List<Award> awards = new ArrayList<>();
    private String selectedTemplateId;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor @JsonIgnoreProperties(ignoreUnknown = false)
    public static class PersonalInfo {
        private String name;
        private String email;
        private String phone;
        private String dob;
        private String address;
        private String linkedin;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor @JsonIgnoreProperties(ignoreUnknown = false)
    public static class Experience {
        private Long id;
        private String company;
        private String role;
        private String period;
        @Builder.Default private List<String> details = new ArrayList<>();
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor @JsonIgnoreProperties(ignoreUnknown = false)
    public static class Education {
        private String degree;
        private String school;
        private String year;
        private String gpa;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor @JsonIgnoreProperties(ignoreUnknown = false)
    public static class Skill {
        private String name;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private SkillLevel level;
        private String category;
    }
    @Data @Builder @NoArgsConstructor @AllArgsConstructor @JsonIgnoreProperties(ignoreUnknown = false)
    public static class Project {
        private String name;
        private String period;
        @Builder.Default private List<String> details = new ArrayList<>();
        private String url;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor @JsonIgnoreProperties(ignoreUnknown = false)
    public static class Certificate {
        private String name;
        private String issuer;
        private String date;
        private String url;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor @JsonIgnoreProperties(ignoreUnknown = false)
    public static class Language {
        private String name;
        private String level;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor @JsonIgnoreProperties(ignoreUnknown = false)
    public static class Award {
        private String name;
        private String issuer;
        private String date;
    }
}
