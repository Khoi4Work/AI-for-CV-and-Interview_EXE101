package fpt.su26.exe101.backend.modules.cv.entity;

import jakarta.persistence.*;
import lombok.*;
import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import java.time.LocalDateTime;

@Entity
@Table(name = "CV_Optimization_Jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CVOptimizationJob extends BaseEntity {
    @Column(name = "job_id", nullable = false, unique = true)
    private String jobId;

    @Column(name = "cv_id", nullable = false)
    private java.util.UUID cvId;

    @Column(name = "job_status", nullable = false)
    private String status; // PENDING, PROCESSING, COMPLETED, FAILED

    @Column(name = "progress")
    private Integer progress;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;
}
