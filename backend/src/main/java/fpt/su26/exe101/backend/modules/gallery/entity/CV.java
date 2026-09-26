package fpt.su26.exe101.backend.modules.gallery.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "cvs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CV extends BaseEntity {

    public enum OptimizationState {
        DRAFT, ANALYZING, OPTIMIZING, OPTIMIZED
    }

    @Column(name = "gallery_id", nullable = false)
    private UUID galleryId;

    @Column(nullable = false)
    private String name;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private String content;

    @Column
    private Integer score;

    @Column(name = "ats_score")
    private Integer atsScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "optimization_state")
    private OptimizationState optimizationState = OptimizationState.DRAFT;

    @Column(name = "template_id")
    private String templateId;

    @Column
    private String status = "DRAFT";

    @Column
    private String image;
}
