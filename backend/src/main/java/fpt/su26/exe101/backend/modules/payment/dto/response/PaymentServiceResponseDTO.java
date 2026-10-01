package fpt.su26.exe101.backend.modules.payment.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentServiceResponseDTO {
    private UUID id;
    private String name;
    private BigDecimal price;
    private List<String> benefits;
}
