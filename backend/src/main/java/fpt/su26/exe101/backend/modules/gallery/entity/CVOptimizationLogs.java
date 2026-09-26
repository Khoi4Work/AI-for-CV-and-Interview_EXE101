package fpt.su26.exe101.backend.modules.gallery.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cv_optimization_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CVOptimizationLogs extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_id", nullable = false)
    private CVs cv;

    @Column(name = "section_name", nullable = false)
    private String sectionName;

    @Column(name = "original_text", columnDefinition = "text", nullable = false)
    private String originalText;

    @Column(name = "suggested_text", columnDefinition = "text", nullable = false)
    private String suggestedText;

    @Column(name = "is_accepted")
    private Boolean isAccepted = false;
}
