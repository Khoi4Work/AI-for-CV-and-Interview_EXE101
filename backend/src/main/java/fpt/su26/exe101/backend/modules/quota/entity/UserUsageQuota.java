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
    @Column(nullable = false, length = 20, columnDefinition = "varchar(20) default 'FREE'")
    @Builder.Default
    private UserPlan plan = UserPlan.FREE;
}
