package fpt.su26.exe101.backend.modules.auth.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "attendance_info")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceInfo extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendance_id", unique = true, nullable = false)
    private Attendance attendance;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "career_goal", columnDefinition = "TEXT")
    private String careerGoal;

    @Column(name = "experience_level")
    private String experienceLevel;
}
