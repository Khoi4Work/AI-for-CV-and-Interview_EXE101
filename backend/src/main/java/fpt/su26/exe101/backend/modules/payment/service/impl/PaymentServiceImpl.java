package fpt.su26.exe101.backend.modules.payment.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.gallery.entity.UserUsageQuota;
import fpt.su26.exe101.backend.modules.gallery.repository.UserUsageQuotaRepository;
import fpt.su26.exe101.backend.modules.payment.dto.request.CheckoutRequestDTO;
import fpt.su26.exe101.backend.modules.payment.dto.response.OrderResponseDTO;
import fpt.su26.exe101.backend.modules.payment.dto.response.QuotaResponseDTO;
import fpt.su26.exe101.backend.modules.payment.entity.*;
import fpt.su26.exe101.backend.modules.payment.repository.OrderRepository;
import fpt.su26.exe101.backend.modules.payment.repository.PaymentServiceEntityRepository;
import fpt.su26.exe101.backend.modules.payment.service.PaymentService;
import fpt.su26.exe101.backend.modules.payment.util.PayOSChecksumUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentServiceEntityRepository paymentServiceEntityRepository;
    private final UserUsageQuotaRepository userUsageQuotaRepository;
    private final PayOSChecksumUtil checksumUtil;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${payos.client.id}")
    private String payosClientId;

    @Value("${payos.api.key}")
    private String payosApiKey;

    @Value("${payos.checksum.key}")
    private String payosChecksumKey;

    @Override
    @Transactional
    public OrderResponseDTO checkout(CheckoutRequestDTO request, UUID accountId) {
        log.info("Processing checkout for account: {} and serviceId: {}", accountId, request.getServiceId());

        PaymentServiceEntity paymentService = paymentServiceEntityRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));

        Order order = Order.builder()
                .accountId(accountId)
                .service(paymentService)
                .amount(paymentService.getPrice())
                .status("PENDING")
                .paymentStatus(Order.PaymentStatus.PENDING)
                .paymentMethod(Order.PaymentMethod.valueOf(request.getPaymentMethod().name()))
                .orderedAt(LocalDateTime.now())
                .build();

        order.setCheckoutUrl(createPayOSPaymentLink(order));

        Order savedOrder = orderRepository.save(order);
        return mapToOrderResponseDTO(savedOrder);
    }

    @Override
    @Transactional
    public void handleWebhook(Map<String, Object> payload) {
        log.info("Handling PayOS webhook payload: {}", payload);

        // 1. Verify checksum
        String receivedChecksum = (String) payload.get("signature");
        if (receivedChecksum == null) {
            receivedChecksum = (String) payload.get("checksum");
        }

        Map<String, Object> data = (Map<String, Object>) payload.get("data");
        if (data == null) {
            log.error("Webhook payload is missing 'data' object");
            return;
        }

        // Security: Verify if the data was actually sent by PayOS
        String calculatedChecksum = checksumUtil.calculateChecksum(payosChecksumKey, data);
        if (receivedChecksum == null || !calculatedChecksum.equalsIgnoreCase(receivedChecksum)) {
            log.error("PayOS checksum verification failed! Received: {}, Calculated: {}", receivedChecksum, calculatedChecksum);
            throw new ApiException(ErrorCode.UNAUTHENTICATED);
        }

        // 2. Process payment
        String orderCode = String.valueOf(data.get("orderCode"));
        String statusDesc = String.valueOf(data.get("desc"));

        Order order = orderRepository.findByTransactionId(orderCode).orElse(null);
        if (order == null) {
            log.warn("Order not found for transactionId: {}. This might be a PayOS test request.", orderCode);
            return;
        }

        if ("Thành công".equalsIgnoreCase(statusDesc) || "success".equalsIgnoreCase(statusDesc)) {
            order.setPaymentStatus(Order.PaymentStatus.PAID);
            order.setStatus("COMPLETED");
            updateUserQuota(order);
        } else {
            order.setPaymentStatus(Order.PaymentStatus.FAILED);
            order.setStatus("FAILED");
        }

        orderRepository.save(order);
        log.info("Order {} updated to status {} via webhook", orderCode, statusDesc);
    }

    @Override
    public List<OrderResponseDTO> getPaymentHistory(UUID accountId) {
        return orderRepository.findByAccountId(accountId).stream()
                .map(this::mapToOrderResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public QuotaResponseDTO getCurrentQuota(UUID accountId) {
        UserUsageQuota quota = userUsageQuotaRepository.findByAccountId(accountId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));

        return QuotaResponseDTO.builder()
                .remainingCvCount(quota.getRemainingCvCnt())
                .remainingInterviewMinutes(quota.getRemainingIntMin())
                .build();
    }

    private void updateUserQuota(Order order) {
        UserUsageQuota quota = userUsageQuotaRepository.findByAccountId(order.getAccountId())
                .orElse(UserUsageQuota.builder()
                .accountId(order.getAccountId())
                .remainingCvCnt(0)
                .remainingIntMin(0)
                .build());

        PaymentServiceEntity service = order.getService();
        if (service.getCategory() == PaymentServiceEntity.ServiceCategory.CV) {
            quota.setRemainingCvCnt(quota.getRemainingCvCnt() + service.getBillingUnits());
        } else if (service.getCategory() == PaymentServiceEntity.ServiceCategory.INTERVIEW) {
            quota.setRemainingIntMin(quota.getRemainingIntMin() + service.getBillingUnits());
        }

        userUsageQuotaRepository.save(quota);
        log.info("Updated quota for account: {}. New CV: {}, Interview: {}",
                order.getAccountId(), quota.getRemainingCvCnt(), quota.getRemainingIntMin());
        }

    private String createPayOSPaymentLink(Order order) {
        try {
            // PayOS requires orderCode to be an integer
            long orderCode = System.currentTimeMillis() / 1000;
            order.setTransactionId(String.valueOf(orderCode));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("orderCode", orderCode);
            requestBody.put("amount", order.getAmount().intValue());

            // PayOS limits description to 25 characters
            String description = "Pay " + order.getService().getName();
            if (description.length() > 25) {
                description = description.substring(0, 22) + "...";
            }
            requestBody.put("description", description);
            requestBody.put("cancelUrl", "https://payos.vn/cancel");
            requestBody.put("returnUrl", "https://payos.vn/return");

            // PayOS signature must be created from sorted fields:
            // amount=$amount&cancelUrl=$cancelUrl&description=$description&orderCode=$orderCode&returnUrl=$returnUrl
            String signature = checksumUtil.calculateChecksum(payosChecksumKey, requestBody);
            requestBody.put("signature", signature);

            log.info("Requesting payment link from PayOS for orderCode: {}", orderCode);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", payosClientId);
            headers.set("x-api-key", payosApiKey);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            org.springframework.http.ResponseEntity<Map> responseEntity = restTemplate.exchange(
                    "https://api-merchant.payos.vn/v2/payment-requests",
                    org.springframework.http.HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            Map<String, Object> response = responseEntity.getBody();

            log.info("Full PayOS Response Body: {}", response);

            if (response != null && response.containsKey("data")) {
                Map<String, Object> data = (Map<String, Object>) response.get("data");
                if (data != null && data.containsKey("checkoutUrl")) {
                    return (String) data.get("checkoutUrl");
                }
            }

            if (response != null && response.containsKey("desc")) {
                String errorDesc = String.valueOf(response.get("desc"));
                log.error("PayOS returned error: {}", errorDesc);
                throw new ApiException(ErrorCode.INVALID_INPUT, errorDesc);
            }

            if (response != null && response.containsKey("message")) {
                String errorMsg = String.valueOf(response.get("message"));
                log.error("PayOS returned error message: {}", errorMsg);
                throw new ApiException(ErrorCode.INVALID_INPUT, errorMsg);
            }

            throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND);
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.error("PayOS HTTP Error: Status {}, Body {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR);
        } catch (Exception e) {
            log.error("PayOS payment link creation failed. Message: {}, Cause: {}", e.getMessage(), e.getCause());
            log.error("Full StackTrace: ", e);
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR);
        }
    }

    private OrderResponseDTO mapToOrderResponseDTO(Order order) {
        return OrderResponseDTO.builder()
                .id(order.getId())
                .amount(order.getAmount())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus().name())
                .paymentMethod(order.getPaymentMethod().name())
                .orderedAt(order.getOrderedAt())
                .checkoutUrl(order.getCheckoutUrl())
                .build();
    }
}
