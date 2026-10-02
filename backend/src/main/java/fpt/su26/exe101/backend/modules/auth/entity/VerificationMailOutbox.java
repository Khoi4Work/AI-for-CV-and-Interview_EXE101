package fpt.su26.exe101.backend.modules.auth.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "verification_mail_outbox")
@Getter @Setter @NoArgsConstructor
public class VerificationMailOutbox extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;
    // Temporary delivery payload; cleared after delivery, cancellation or expiry.
    private String token;
    @Column(length = 64, nullable = false)
    private String tokenHash;
    private int attempts;
    @Column(nullable = false)
    private LocalDateTime nextAttemptAt;
    private LocalDateTime sentAt;
    private boolean canceled;
}
