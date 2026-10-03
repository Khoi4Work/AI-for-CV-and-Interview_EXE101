package fpt.su26.exe101.backend.modules.payment.service;

import fpt.su26.exe101.backend.modules.payment.entity.*;
import fpt.su26.exe101.backend.modules.payment.repository.OrderRepository;
import fpt.su26.exe101.backend.modules.payment.service.impl.PaymentServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentHistoryServiceTest {
    @Mock OrderRepository orders;
    @InjectMocks PaymentServiceImpl service;

    @Test void historyIncludesServiceInfoAndHandlesLegacyMissingMethod() {
        UUID accountId = UUID.randomUUID();
        PaymentServiceEntity product = PaymentServiceEntity.builder().name("CV Middle").build();
        product.setId(UUID.randomUUID());
        Order order = Order.builder().accountId(accountId).service(product).amount(new BigDecimal("39000"))
                .status("COMPLETED").paymentStatus(Order.PaymentStatus.PAID).build();
        when(orders.findPaymentHistoryByAccountId(accountId)).thenReturn(List.of(order));
        var dto = service.getPaymentHistory(accountId).getFirst();
        assertEquals(product.getId(), dto.getServiceId());
        assertEquals("CV Middle", dto.getServiceName());
        assertEquals("PAID", dto.getPaymentStatus());
        assertNull(dto.getPaymentMethod());
        assertEquals(order.getCreatedAt(), dto.getOrderedAt());
        verify(orders).findPaymentHistoryByAccountId(accountId);
    }

    @Test void noOrdersReturnsEmptyHistory() {
        UUID accountId = UUID.randomUUID();
        when(orders.findPaymentHistoryByAccountId(accountId)).thenReturn(List.of());
        assertTrue(service.getPaymentHistory(accountId).isEmpty());
    }
}
