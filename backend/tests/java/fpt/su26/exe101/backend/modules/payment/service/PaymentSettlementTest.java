package fpt.su26.exe101.backend.modules.payment.service;

import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.modules.payment.entity.Order;
import fpt.su26.exe101.backend.modules.payment.entity.PaymentServiceEntity;
import fpt.su26.exe101.backend.modules.payment.repository.OrderRepository;
import fpt.su26.exe101.backend.modules.payment.service.impl.PaymentServiceImpl;
import fpt.su26.exe101.backend.modules.payment.util.PayOSChecksumUtil;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentSettlementTest {
    @Mock OrderRepository orders;
    @Mock PayOSChecksumUtil checksum;
    @Mock UsageQuotaService quota;
    @InjectMocks PaymentServiceImpl service;

    private Map<String,Object> webhook(Order order) {
        ReflectionTestUtils.setField(service,"payosChecksumKey","key");
        Map<String,Object> data=Map.of("orderCode","123","desc","success");
        when(checksum.calculateChecksum("key",data)).thenReturn("signature");
        when(orders.findByTransactionIdForUpdate("123")).thenReturn(Optional.of(order));
        return Map.of("data",data,"signature","signature");
    }

    @Test void successfulWebhookRecordsSettlementOnceAndDoesNotGrantTwice() {
        UUID accountId=UUID.randomUUID();
        var product=PaymentServiceEntity.builder().category(PaymentServiceEntity.ServiceCategory.CV)
                .packageCode(PaymentServiceEntity.PackageCode.MIDDLE).billingUnits(5).build();
        var order=Order.builder().accountId(accountId).service(product).paymentStatus(Order.PaymentStatus.PENDING).build();
        var payload=webhook(order);
        service.handleWebhook(payload);
        var paidAt=order.getPaidAt();
        assertNotNull(paidAt);
        assertEquals(Order.PaymentStatus.PAID,order.getPaymentStatus());
        service.handleWebhook(payload);
        assertEquals(paidAt,order.getPaidAt());
        verify(quota,times(1)).grantCvPackage(accountId,UserPlan.MIDDLE,5);
        verify(orders,times(1)).save(order);
    }

    @Test void delayedSuccessCannotUndoARefund() {
        var order=Order.builder().paymentStatus(Order.PaymentStatus.REFUNDED).build();
        service.handleWebhook(webhook(order));
        assertEquals(Order.PaymentStatus.REFUNDED,order.getPaymentStatus());
        assertNull(order.getPaidAt());
        verifyNoInteractions(quota);
        verify(orders,never()).save(any());
    }
}
