package fpt.su26.exe101.backend.modules.payment.dto.request;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequestDTO {
    private UUID serviceId;
    private PaymentMethod paymentMethod;

    public enum PaymentMethod {
        CREDIT_CARD, E_WALLET, BANK_TRANSFER
    }
}
