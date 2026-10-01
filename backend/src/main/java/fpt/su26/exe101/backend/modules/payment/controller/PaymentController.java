package fpt.su26.exe101.backend.modules.payment.controller;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.base.response.ApiResponse;
import fpt.su26.exe101.backend.modules.auth.entity.Account;
import fpt.su26.exe101.backend.modules.auth.repository.AccountRepository;
import fpt.su26.exe101.backend.modules.payment.dto.request.CheckoutRequestDTO;
import fpt.su26.exe101.backend.modules.payment.dto.response.OrderResponseDTO;
import fpt.su26.exe101.backend.modules.payment.dto.response.QuotaResponseDTO;
import fpt.su26.exe101.backend.modules.payment.dto.response.PaymentServiceResponseDTO;
import fpt.su26.exe101.backend.modules.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

    @RestController
    @RequestMapping("/api/v1/payments")
    @RequiredArgsConstructor
    public class PaymentController {

        private final PaymentService paymentService;
        private final AccountRepository accountRepository;

        @GetMapping("/services")
        public ResponseEntity<ApiResponse<List<PaymentServiceResponseDTO>>> getServices() {
            return ResponseEntity.ok(ApiResponse.success(paymentService.getAvailableServices()));
        }

        @PostMapping("/checkout")
        public ResponseEntity<ApiResponse<OrderResponseDTO>> checkout(
            @RequestBody CheckoutRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            throw new ApiException(ErrorCode.UNAUTHENTICATED);
        }

        String email = userDetails.getUsername();
        UUID accountId = accountRepository.findByEmail(email)
                .map(Account::getId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));

        OrderResponseDTO response = paymentService.checkout(request, accountId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<OrderResponseDTO>>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            throw new ApiException(ErrorCode.UNAUTHENTICATED);
        }

        String email = userDetails.getUsername();
        UUID accountId = accountRepository.findByEmail(email)
                .map(Account::getId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));

        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentHistory(accountId)));
    }

    @GetMapping("/quota")
    public ResponseEntity<ApiResponse<QuotaResponseDTO>> getQuota(
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            throw new ApiException(ErrorCode.UNAUTHENTICATED);
        }

        String email = userDetails.getUsername();
        UUID accountId = accountRepository.findByEmail(email)
                .map(Account::getId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));

        return ResponseEntity.ok(ApiResponse.success(paymentService.getCurrentQuota(accountId)));
    }

    @GetMapping("/webhook")
    public ResponseEntity<ApiResponse<String>> checkWebhook() {
        return ResponseEntity.ok(ApiResponse.success("Payment Webhook is active and listening for POST requests."));
    }

    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<Void>> handleWebhook(
            @RequestBody java.util.Map<String, Object> payload) {

        paymentService.handleWebhook(payload);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
