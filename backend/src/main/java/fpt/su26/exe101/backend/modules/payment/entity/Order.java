package fpt.su26.exe101.backend.modules.payment.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {
    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private PaymentServiceEntity service;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 20)
    private String status; // PENDING, COMPLETED, FAILED

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "transaction_id", length = 255)
    private String transactionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Column(name = "checkout_url", columnDefinition = "TEXT")
    private String checkoutUrl;

    @Column(name = "ordered_at")
    private LocalDateTime orderedAt = LocalDateTime.now();

    public enum PaymentStatus {
        PENDING, PAID, FAILED, REFUNDED
    }

    public enum PaymentMethod {
        CREDIT_CARD, E_WALLET, BANK_TRANSFER
    }
}
