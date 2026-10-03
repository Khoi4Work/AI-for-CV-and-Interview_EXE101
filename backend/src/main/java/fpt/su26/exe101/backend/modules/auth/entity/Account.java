package fpt.su26.exe101.backend.modules.auth.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import fpt.su26.exe101.backend.modules.auth.entity.enums.AccountRole;
import fpt.su26.exe101.backend.modules.auth.entity.enums.AccountProvider;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "account")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account extends BaseEntity {
    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = true)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false)
    private AccountProvider provider;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private AccountRole role;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "verification_token")
    private String verificationToken;

    private LocalDateTime verificationExpiresAt;
    private LocalDateTime verificationLastSentAt;
    private LocalDateTime verifiedAt;
    private LocalDateTime verificationManagedAt;

    @Column(name = "reset_password_token")
    private String resetPasswordToken;
}
