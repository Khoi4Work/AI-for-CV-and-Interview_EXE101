package fpt.su26.exe101.backend.modules.payment.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "payment_services")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class PaymentServiceEntity extends BaseEntity {
    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "package_code", nullable = false)
    private PackageCode packageCode;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "billing_units", nullable = false)
    private Integer billingUnits;

    public enum ServiceCategory {
        CV, INTERVIEW
    }

    public enum PackageCode {
        FREE, MIDDLE, ENHANCE
    }
}
