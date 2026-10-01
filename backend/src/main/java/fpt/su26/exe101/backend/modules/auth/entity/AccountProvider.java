package fpt.su26.exe101.backend.modules.auth.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "account_provider")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountProvider extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "provider_name", nullable = false)
    private String providerName;

    @Column(name = "provider_id", nullable = false)
    private String providerId;
}
