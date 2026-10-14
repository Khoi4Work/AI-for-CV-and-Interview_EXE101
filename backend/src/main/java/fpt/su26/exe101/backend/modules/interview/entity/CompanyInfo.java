package fpt.su26.exe101.backend.modules.interview.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "company_info")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyInfo extends BaseEntity {
    @Column(name = "company_name", nullable = false, length = 255)
    private String companyName;

    @Column(name = "culture_desc", columnDefinition = "TEXT")
    private String cultureDescription;

    @Column(name = "tech_stack", columnDefinition = "TEXT")
    private String techStack;

    @Column(name = "employee_insights", columnDefinition = "TEXT")
    private String employeeInsights;

    @Column(name = "culture_source_url", length = 255)
    private String cultureSourceUrl;

    @Column(name = "culture_reference_date")
    private LocalDate cultureReferenceDate;

    @Builder.Default
    @Column(name = "culture_verified", nullable = false)
    private boolean cultureVerified = false;
}
