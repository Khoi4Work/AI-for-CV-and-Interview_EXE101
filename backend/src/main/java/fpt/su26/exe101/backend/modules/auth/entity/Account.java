package fpt.su26.exe101.backend.modules.auth.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import fpt.su26.exe101.backend.modules.auth.entity.enums.AccountRole;
import jakarta.persistence.*;
import lombok.*;

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

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private AccountRole role;

    @Column(name = "status", nullable = false)
    private String status;
}
