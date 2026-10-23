package fpt.su26.exe101.backend.modules.payment.service;

import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.modules.payment.entity.Order;
import fpt.su26.exe101.backend.modules.payment.entity.PaymentServiceEntity;
import fpt.su26.exe101.backend.modules.payment.repository.*;
import fpt.su26.exe101.backend.modules.payment.service.impl.PaymentServiceImpl;
import fpt.su26.exe101.backend.modules.payment.util.PayOSChecksumUtil;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaymentWebhookChecksumTest {
    private final OrderRepository orders = mock(OrderRepository.class);
    private final PaymentLogRepository logs = mock(PaymentLogRepository.class);
    private final UsageQuotaService quota = mock(UsageQuotaService.class);
    private final PaymentServiceImpl service = new PaymentServiceImpl(orders, logs,
            mock(PaymentServiceEntityRepository.class), mock(CVBenefitRepository.class),
            mock(InterviewBenefitRepository.class), quota, new PayOSChecksumUtil());

    private Map<String, Object> data() {
        ReflectionTestUtils.setField(service, "payosChecksumKey", "test-checksum-key");
        Map<String, Object> data = new LinkedHashMap<>(Map.of(
                "orderCode", 1792740200L, "amount", 59000, "code", "00", "desc", "success"));
        data.put("counterAccountName", null);
        return data;
    }

    private Map<String, Object> payload(Map<String, Object> data) {
        return Map.of("data", data, "signature", "a969694f70c8a12fa0effd5c8811b8ead356b398c4a5ea698aea9f42f0caad49");
    }

    @Test void signedNullFieldWebhookSettlesEnhanceAndDuplicateDoesNotGrantAgain() {
        UUID accountId = UUID.randomUUID();
        var product = PaymentServiceEntity.builder().category(PaymentServiceEntity.ServiceCategory.CV)
                .packageCode(PaymentServiceEntity.PackageCode.ENHANCE).billingUnits(4).build();
        var order = Order.builder().accountId(accountId).service(product)
                .paymentStatus(Order.PaymentStatus.PENDING).status("PENDING").build();
        when(orders.findByTransactionIdForUpdate("1792740200")).thenReturn(Optional.of(order));
        var webhook = payload(data());
        service.handleWebhook(webhook);
        service.handleWebhook(webhook);
        assertEquals(Order.PaymentStatus.PAID, order.getPaymentStatus());
        assertEquals("COMPLETED", order.getStatus());
        assertNotNull(order.getPaidAt());
        verify(quota, times(1)).grantCvPackage(accountId, UserPlan.ENHANCE, 4);
        verify(orders, times(1)).save(order);
        verify(logs).save(argThat(event -> "PAYMENT_SUCCEEDED".equals(event.getEventType())));
        verify(logs).save(argThat(event -> "WEBHOOK_IGNORED".equals(event.getEventType())));
    }

    @Test void tamperedWebhookStillCannotChangeOrdersOrGrantQuota() {
        Map<String, Object> changed = data();
        changed.put("amount", 59001);
        ApiException error = assertThrows(ApiException.class, () -> service.handleWebhook(payload(changed)));
        assertEquals("Invalid payment webhook signature.", error.getMessage());
        verifyNoInteractions(orders, logs, quota);
    }
}
