package fpt.su26.exe101.backend.modules.auth.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "token")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Token extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", unique = true, nullable = false)
    private Account account;

    @Column(name = "refresh_token", nullable = false, length = 1024)
    private String refreshToken;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
}
