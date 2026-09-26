package fpt.su26.exe101.backend.modules.gallery.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import fpt.su26.exe101.backend.modules.gallery.entity.enums.InterviewType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSessions extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gallery_id", nullable = false)
    private Gallery gallery;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_ref_id")
    private CVs cvRef;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jd_ref_id")
    private JobDescriptions jdRef;

    @Enumerated(EnumType.STRING)
    @Column(name = "interview_type", nullable = false)
    private InterviewType interviewType;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "candidate_experience_level", nullable = false)
    private String candidateExperienceLevel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "context_snapshot", columnDefinition = "jsonb", nullable = false)
    private String contextSnapshot;

    @Column(name = "overall_score")
    private Integer overallScore;

    @Column(name = "culture_fit_score")
    private Integer cultureFitScore;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "feedback_json", columnDefinition = "jsonb")
    private String feedbackJson;

    @Column(name = "session_date")
    private LocalDateTime sessionDate = LocalDateTime.now();
}
