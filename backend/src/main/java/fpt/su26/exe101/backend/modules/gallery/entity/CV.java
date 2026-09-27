package fpt.su26.exe101.backend.modules.gallery.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import fpt.su26.exe101.backend.modules.gallery.entity.enums.OptimizationState;
import java.util.Map;

@Entity
@Table(name = "CVs", uniqueConstraints = @UniqueConstraint(name = "uk_cv_gallery_source_hash", columnNames = {"gallery_id", "source_hash"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CV extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gallery_id", nullable = false)
    private Gallery gallery;

    @Column(nullable = false, length = 100)
    private String name;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> content;

    private Integer score;

    @Column(name = "ats_score")
    private Integer atsScore;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "optimization_state")
    private OptimizationState optimizationState = OptimizationState.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", foreignKey = @ForeignKey(name = "FK_CV_TEMPLATE"))
    private CVTemplate template;

    @Builder.Default
    @Column(length = 20)
    private String status = "DRAFT";

    @Column(columnDefinition = "TEXT")
    private String image;

    @Column(name = "source_hash", length = 64)
    private String sourceHash;
}
