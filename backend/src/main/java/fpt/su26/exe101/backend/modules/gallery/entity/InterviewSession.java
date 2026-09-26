package fpt.su26.exe101.backend.modules.gallery.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import fpt.su26.exe101.backend.modules.gallery.entity.enums.InterviewType;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "Interview_Sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSession extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gallery_id", nullable = false)
    private Gallery gallery;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_ref_id")
    private CV cv;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jd_ref_id")
    private JobDescription jobDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "interview_type", nullable = false)
    private InterviewType interviewType;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "candidate_experience_level", nullable = false, length = 50)
    private String candidateExperienceLevel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "context_snapshot", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> contextSnapshot;

    @Column(name = "overall_score")
    private Integer overallScore;

    @Column(name = "culture_fit_score")
    private Integer cultureFitScore;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "feedback_json", columnDefinition = "jsonb")
    private Map<String, Object> feedbackJson;

    @Column(name = "session_date")
    private LocalDateTime sessionDate;
}
