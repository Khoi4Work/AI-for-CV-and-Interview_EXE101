package fpt.su26.exe101.backend.modules.gallery.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import fpt.su26.exe101.backend.modules.gallery.entity.enums.OptimizationState;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "cvs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CVs extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gallery_id", nullable = false)
    private Gallery gallery;

    @Column(nullable = false)
    private String name;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private String content;

    private Integer score;

    @Column(name = "ats_score")
    private Integer atsScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "optimization_state")
    private OptimizationState optimizationState = OptimizationState.DRAFT;

    @Column(name = "template_id")
    private String templateId;

    private String status = "DRAFT";

    @Column(columnDefinition = "text")
    private String image;
}
