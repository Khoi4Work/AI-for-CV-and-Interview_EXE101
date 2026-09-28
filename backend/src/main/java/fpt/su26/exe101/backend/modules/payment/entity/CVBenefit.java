package fpt.su26.exe101.backend.modules.payment.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cv_benefit")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CVBenefit extends BaseEntity {
    @OneToOne
    @JoinColumn(name = "service_id", nullable = false, unique = true)
    private Service service;

    @Column(name = "max_templates", nullable = false)
    private Integer maxTemplates;

    @Column(name = "allow_semantic_sugg", nullable = false)
    private Boolean allowSemanticSugg = false;

    @Column(name = "allow_skill_sugg", nullable = false)
    private Boolean allowSkillSugg = false;

    @Column(name = "show_pass_rate", nullable = false)
    private Boolean showPassRate = false;
}
