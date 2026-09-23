package fpt.su26.exe101.backend.modules.auth.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "attendance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", unique = true, nullable = false)
    private Account account;

    @Column(name = "display_name", nullable = false)
    private String displayName;
}
