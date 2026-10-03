package fpt.su26.exe101.backend.modules.quota.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import fpt.su26.exe101.backend.base.enums.UserPlan;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_usage_quotas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUsageQuota extends BaseEntity {
    @Column(unique = true, nullable = false)
    private java.util.UUID accountId;

    @Column(nullable = false)
    private int remainingCvCnt;

    @Column(nullable = false)
    private int remainingIntMin;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int remainingCvAiCnt;

    @Enumerated(EnumType.STRING)
    @Column(name = "cv_plan", nullable = false, length = 20, columnDefinition = "varchar(20) default 'FREE'")
    @Builder.Default
    private UserPlan cvPlan = UserPlan.FREE;

    @Enumerated(EnumType.STRING)
    @Column(name = "interview_plan", nullable = false, length = 20, columnDefinition = "varchar(20) default 'FREE'")
    @Builder.Default
    private UserPlan interviewPlan = UserPlan.FREE;

    @Column(name = "cv_period_start")
    private java.time.LocalDateTime cvPeriodStart;

    @Column(name = "cv_period_end")
    private java.time.LocalDateTime cvPeriodEnd;

    @Column(name = "interview_period_start")
    private java.time.LocalDateTime interviewPeriodStart;

    @Column(name = "interview_period_end")
    private java.time.LocalDateTime interviewPeriodEnd;

    @Builder.Default
    @Column(name = "cv_expiry_email_sent", nullable = false)
    private boolean cvExpiryEmailSent = false;

    @Builder.Default
    @Column(name = "interview_expiry_email_sent", nullable = false)
    private boolean interviewExpiryEmailSent = false;
}
