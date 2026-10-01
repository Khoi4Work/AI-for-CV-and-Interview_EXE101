package fpt.su26.exe101.backend.modules.interview.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

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
}
