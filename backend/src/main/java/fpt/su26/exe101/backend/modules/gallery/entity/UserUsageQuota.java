package fpt.su26.exe101.backend.modules.gallery.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
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
}
