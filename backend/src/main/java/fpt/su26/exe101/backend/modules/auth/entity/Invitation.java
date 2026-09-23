package fpt.su26.exe101.backend.modules.auth.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import fpt.su26.exe101.backend.modules.auth.entity.enums.AccountRole;
import fpt.su26.exe101.backend.modules.auth.entity.enums.InvitationStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "invitation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invitation extends BaseEntity {
    @Column(name = "email", nullable = false)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inviter_id", nullable = false)
    private Account inviter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Partner company;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private AccountRole role;

    @Column(name = "token", unique = true, nullable = false)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private InvitationStatus status;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
}
