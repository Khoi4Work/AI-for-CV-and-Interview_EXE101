package fpt.su26.exe101.backend.modules.gallery.entity;

import jakarta.persistence.*;
import lombok.*;
import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import java.util.UUID;

@Entity
@Table(name = "Gallery")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Gallery extends BaseEntity {
    @Column(name = "account_id", nullable = false, unique = true)
    private UUID accountId;
}
