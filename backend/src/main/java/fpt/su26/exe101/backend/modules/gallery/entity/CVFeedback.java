package fpt.su26.exe101.backend.modules.gallery.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "cv_feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CVFeedback extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_id", nullable = false)
    private CVs cv;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jd_id", nullable = false)
    private JobDescriptions jd;

    @Column(name = "overall_score")
    private Integer overallScore;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "feedback_json", columnDefinition = "jsonb", nullable = false)
    private String feedbackJson;
}
