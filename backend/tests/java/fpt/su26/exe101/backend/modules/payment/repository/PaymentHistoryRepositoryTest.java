package fpt.su26.exe101.backend.modules.payment.repository;

import fpt.su26.exe101.backend.modules.payment.entity.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfigurationPackage;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.ContextConfiguration;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:payment_history;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
    "spring.datasource.username=sa", "spring.datasource.password=",
    "spring.datasource.driver-class-name=org.h2.Driver", "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect", "spring.jpa.show-sql=false"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ContextConfiguration(classes = PaymentHistoryRepositoryTest.Config.class)
class PaymentHistoryRepositoryTest {
    @Configuration @AutoConfigurationPackage
    @EntityScan(basePackageClasses = Order.class)
    @EnableJpaRepositories(basePackageClasses = OrderRepository.class)
    static class Config {}
    @Autowired OrderRepository orders;
    @Autowired PaymentServiceEntityRepository products;

    @Test void historyIsScopedAndNewestFirstWithFallbackForLegacyDates() {
        UUID owner = UUID.randomUUID();
        var product = products.save(PaymentServiceEntity.builder().name("CV Middle")
            .category(PaymentServiceEntity.ServiceCategory.CV).packageCode(PaymentServiceEntity.PackageCode.MIDDLE)
            .price(new BigDecimal("39000")).billingUnits(5).build());
        var old = saveOrder(owner, product, LocalDateTime.of(2026, 10, 1, 8, 0));
        var latest = saveOrder(owner, product, LocalDateTime.of(2026, 10, 3, 8, 0));
        var legacy = saveOrder(owner, product, null);
        saveOrder(UUID.randomUUID(), product, LocalDateTime.of(2026, 10, 4, 8, 0));
        var result = orders.findPaymentHistoryByAccountId(owner);
        assertEquals(3, result.size());
        assertEquals(latest.getId(), result.get(0).getId());
        assertEquals(legacy.getId(), result.get(1).getId());
        assertEquals(old.getId(), result.get(2).getId());
        assertEquals("CV Middle", result.get(0).getService().getName());
        assertTrue(orders.findPaymentHistoryByAccountId(UUID.randomUUID()).isEmpty());
    }

    private Order saveOrder(UUID owner, PaymentServiceEntity product, LocalDateTime date) {
        var order = Order.builder().accountId(owner).service(product).amount(product.getPrice())
            .status("PENDING").paymentStatus(Order.PaymentStatus.PENDING).orderedAt(date).build();
        order.setCreatedAt(LocalDateTime.of(2026, 10, 2, 8, 0));
        return orders.saveAndFlush(order);
    }
}
