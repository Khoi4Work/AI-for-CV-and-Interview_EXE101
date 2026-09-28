package fpt.su26.exe101.backend.modules.payment.service;

import fpt.su26.exe101.backend.modules.payment.dto.request.CheckoutRequestDTO;
import fpt.su26.exe101.backend.modules.payment.dto.response.OrderResponseDTO;
import fpt.su26.exe101.backend.modules.payment.dto.response.QuotaResponseDTO;
import java.util.List;
import java.util.UUID;

public interface PaymentService {
    OrderResponseDTO checkout(CheckoutRequestDTO request, UUID accountId);
    void handleWebhook(java.util.Map<String, Object> payload);
    List<OrderResponseDTO> getPaymentHistory(UUID accountId);
    QuotaResponseDTO getCurrentQuota(UUID accountId);
}
