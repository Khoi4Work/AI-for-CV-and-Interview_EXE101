package fpt.su26.exe101.backend.modules.gallery.entity;

import jakarta.persistence.*;
import lombok.*;
import fpt.su26.exe101.backend.base.persistence.BaseEntity;

@Entity
@Table(name = "CV_Optimization_Logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CVOptimizationLog extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_id", nullable = false)
    private CV cv;

    @Column(name = "section_name", nullable = false, length = 100)
    private String sectionName;

    @Column(name = "original_text", nullable = false, columnDefinition = "TEXT")
    private String originalText;

    @Column(name = "suggested_text", nullable = false, columnDefinition = "TEXT")
    private String suggestedText;

    @Builder.Default
    @Column(name = "is_accepted")
    private Boolean isAccepted = false;
}
