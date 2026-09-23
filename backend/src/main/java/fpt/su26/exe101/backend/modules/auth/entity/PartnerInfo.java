package fpt.su26.exe101.backend.modules.auth.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "partner_info")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerInfo extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id", unique = true, nullable = false)
    private Partner partner;

    @Column(name = "industry")
    private String industry;

    @Column(name = "company_size")
    private String companySize;
}
