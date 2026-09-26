package fpt.su26.exe101.backend.modules.gallery.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import fpt.su26.exe101.backend.modules.auth.entity.Account;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "gallery")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Gallery extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false, unique = true)
    private Account account;
}
