package fpt.su26.exe101.backend.modules.payment.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponseDTO {
    private UUID id;
    private String invoiceNumber;
    private BigDecimal totalAmount;
    private LocalDateTime issuedAt;
}
