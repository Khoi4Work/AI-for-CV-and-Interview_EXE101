package fpt.su26.exe101.backend.modules.gallery.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "interview_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSession extends BaseEntity {

    public enum InterviewType {
        TECHNICAL, HR, BEHAVIORAL
    }

    @Column(name = "gallery_id", nullable = false)
    private UUID galleryId;

    @Column(name = "cv_ref_id")
    private UUID cvRefId;

    @Column(name = "jd_ref_id")
    private UUID jdRefId;

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
