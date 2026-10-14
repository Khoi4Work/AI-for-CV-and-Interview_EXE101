package fpt.su26.exe101.backend.modules.payment.repository;

import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.modules.payment.entity.*;
import fpt.su26.exe101.backend.modules.payment.dto.request.CheckoutRequestDTO;
import fpt.su26.exe101.backend.modules.payment.service.impl.PaymentServiceImpl;
import fpt.su26.exe101.backend.modules.payment.util.PayOSChecksumUtil;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfigurationPackage;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.*;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.MediaType;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.*;
import org.springframework.transaction.support.TransactionTemplate;
import java.math.BigDecimal;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@DataJpaTest(properties={
    "spring.datasource.url=jdbc:h2:mem:payment_logs;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
    "spring.datasource.username=sa", "spring.datasource.password=", "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop", "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
    "spring.jpa.show-sql=false", "payos.client.id=test", "payos.api.key=test", "payos.checksum.key=key"
})
@AutoConfigureTestDatabase(replace=AutoConfigureTestDatabase.Replace.NONE)
@ContextConfiguration(classes=PaymentLogPersistenceTest.Config.class)
@Import(PaymentServiceImpl.class)
@Transactional(propagation=Propagation.NOT_SUPPORTED)
class PaymentLogPersistenceTest {
    @Configuration @AutoConfigurationPackage @EntityScan(basePackageClasses=Order.class)
    @EnableJpaRepositories(basePackageClasses=OrderRepository.class)
    static class Config {}
    @Autowired OrderRepository orders;
    @Autowired PaymentServiceEntityRepository products;
    @Autowired PaymentLogRepository logs;
    @Autowired PaymentServiceImpl service;
    @Autowired PlatformTransactionManager transactions;
    @MockBean UsageQuotaService quota;
    @MockBean PayOSChecksumUtil checksum;
    UUID id, accountId;
    final Map<String,Object> data=Map.of("orderCode","123","desc","success","amount",39000);

    @BeforeEach void setup() {
        accountId=UUID.randomUUID();
        id=new TransactionTemplate(transactions).execute(status -> {
            var product=products.save(PaymentServiceEntity.builder().name("CV Middle")
                    .category(PaymentServiceEntity.ServiceCategory.CV).packageCode(PaymentServiceEntity.PackageCode.MIDDLE)
                    .billingUnits(5).price(new BigDecimal("39000")).build());
            return orders.save(Order.builder().accountId(accountId).service(product).amount(product.getPrice())
                    .status("PENDING").paymentStatus(Order.PaymentStatus.PENDING).transactionId("123").build()).getId();
        });
        when(checksum.calculateChecksum("key",data)).thenReturn("valid");
    }

    @AfterEach void cleanup() {
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            logs.deleteAllInBatch(); orders.deleteAllInBatch(); products.deleteAllInBatch();
        });
    }

    @Test void webhookCommitsSearchableJsonEventsAndKeepsRepeatedPaymentsIdempotent() {
        service.handleWebhook(Map.of("data",data,"signature","valid"));
        service.handleWebhook(Map.of("data",data,"signature","valid"));
        var order=orders.findById(id).orElseThrow();
        assertEquals(Order.PaymentStatus.PAID,order.getPaymentStatus());
        assertNotNull(order.getPaidAt());
        var events=logs.findAll();
        assertEquals(2,events.size());
        assertEquals(Set.of("PAYMENT_SUCCEEDED","WEBHOOK_IGNORED"),
                new HashSet<>(events.stream().map(PaymentLog::getEventType).toList()));
        events.forEach(event -> {
            assertEquals(id,event.getOrder().getId());
            assertNotNull(event.getCreatedAt());
            assertEquals(39000,((Number)event.getPayload().get("amount")).intValue());
            assertFalse(event.getPayload().containsKey("signature"));
        });
        verify(quota,times(1)).grantCvPackage(accountId,UserPlan.MIDDLE,5);
    }

    @Test void quotaFailureRollsBackOrderAndDoesNotLeaveSuccessEvents() {
        doThrow(new IllegalStateException("quota write failed")).when(quota).grantCvPackage(accountId,UserPlan.MIDDLE,5);
        assertThrows(IllegalStateException.class,()->service.handleWebhook(Map.of("data",data,"signature","valid")));
        var order=orders.findById(id).orElseThrow();
        assertEquals(Order.PaymentStatus.PENDING,order.getPaymentStatus());
        assertNull(order.getPaidAt());
        assertEquals(0,logs.count());
    }

    @Test void checkoutStoresInitialEventWithoutPrivateCheckoutUrl() {
        var provider=MockRestServiceServer.bindTo((RestTemplate)ReflectionTestUtils.getField(service,"restTemplate")).build();
        provider.expect(requestTo("https://api-merchant.payos.vn/v2/payment-requests"))
                .andRespond(withSuccess("{\"data\":{\"checkoutUrl\":\"https://example.test/private-checkout\"}}",MediaType.APPLICATION_JSON));
        when(checksum.calculateChecksum(eq("key"),anyMap())).thenReturn("valid");
        var product=products.findAll().getFirst();
        var response=service.checkout(CheckoutRequestDTO.builder().serviceId(product.getId())
                .paymentMethod(CheckoutRequestDTO.PaymentMethod.BANK_TRANSFER).build(),accountId);
        var event=logs.findAll().getFirst();
        assertEquals(response.getId(),event.getOrder().getId());
        assertEquals("CHECKOUT_CREATED",event.getEventType());
        assertEquals("BANK_TRANSFER",event.getPayload().get("paymentMethod"));
        assertFalse(event.getPayload().containsKey("checkoutUrl"));
        assertEquals(Order.PaymentStatus.PENDING,orders.findById(response.getId()).orElseThrow().getPaymentStatus());
        verifyNoInteractions(quota);
        provider.verify();
    }
}
