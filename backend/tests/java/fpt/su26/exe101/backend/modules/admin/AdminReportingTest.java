package fpt.su26.exe101.backend.modules.admin;

import fpt.su26.exe101.backend.modules.admin.repository.AdminRepository;
import fpt.su26.exe101.backend.modules.admin.service.AdminService;
import fpt.su26.exe101.backend.modules.auth.repository.AccountRepository;
import fpt.su26.exe101.backend.modules.payment.repository.OrderRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfigurationPackage;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.*;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ContextConfiguration;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(properties={"spring.datasource.url=jdbc:h2:mem:admin_reporting;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
    "spring.datasource.username=sa","spring.datasource.password=","spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop","spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"})
@AutoConfigureTestDatabase(replace=AutoConfigureTestDatabase.Replace.NONE)
@ContextConfiguration(classes=AdminReportingTest.Config.class)
@Import({AdminRepository.class,AdminService.class})
class AdminReportingTest {
    @Configuration @AutoConfigurationPackage @EntityScan("fpt.su26.exe101.backend.modules")
    @EnableJpaRepositories(basePackageClasses={AccountRepository.class,OrderRepository.class})
    static class Config {}
    @Autowired JdbcTemplate jdbc;
    @Autowired AdminService service;
    UUID account,product;
    final LocalDate day=LocalDate.of(2026,10,10);
    @BeforeEach void setup() {
        account=UUID.randomUUID(); product=UUID.randomUUID();
        jdbc.update("insert into account(id,email,password_hash,role,status,provider,created_at) values(?,?,?,?,?,?,?)",account,"owner@example.test","secret-hash","ATTENDANCE","ACTIVE","LOCAL",day.atStartOfDay());
        jdbc.update("insert into payment_services(id,name,category,package_code,price,billing_units,created_at) values(?,?,?,?,?,?,?)",product,"CV Middle","CV","MIDDLE",new BigDecimal("100000"),5,day.atStartOfDay());
    }
    UUID order(String state,String amount,LocalDateTime paid,LocalDateTime refund,boolean test) {
        UUID id=UUID.randomUUID();
        jdbc.update("insert into orders(id,account_id,service_id,amount,status,payment_status,ordered_at,created_at,paid_at,refunded_at,is_test) values(?,?,?,?,?,?,?,?,?,?,?)",
            id,account,product,new BigDecimal(amount),"COMPLETED",state,day.atStartOfDay(),day.atStartOfDay(),paid,refund,test);
        return id;
    }
    @Test void totalsUseSettlementDatesAndExcludeTestPendingAndUndatedRevenue() {
        order("PAID","100000",day.atTime(10,0),null,false);
        order("PENDING","900000",null,null,false);
        order("REFUNDED","200000",day.minusDays(1).atTime(10,0),day.atTime(12,0),false);
        order("PAID","50000",null,null,false);
        order("PAID","999999",day.atTime(10,0),null,true);
        var data=service.statistics(day,day);
        var overview=(Map<?,?>)data.get("overview");
        assertEquals(0,new BigDecimal("100000").compareTo((BigDecimal)overview.get("grossRevenue")));
        assertEquals(0,new BigDecimal("200000").compareTo((BigDecimal)overview.get("refundAmount")));
        assertEquals(4L,((Number)overview.get("totalOrders")).longValue());
        assertEquals(1L,((Number)overview.get("undatedPaidOrders")).longValue());
        assertEquals(1,((List<?>)data.get("daily")).size());
        assertEquals(1,((List<?>)data.get("services")).size());
    }
    @Test void paymentPaginationFiltersSearchAndOptionalTestOrders() {
        order("PAID","100",day.atTime(10,0),null,false);
        order("PAID","200",day.atTime(11,0),null,true);
        assertEquals(1,service.payments("owner","PAID","CV",false,day,day,0,1).totalElements());
        assertEquals(2,service.payments("owner","PAID","CV",true,day,day,0,1).totalElements());
        assertEquals(0,service.payments("missing","","",true,day,day,0,20).totalElements());
    }
    @Test void userDtoDoesNotExposeSecretsAndKeepsAccountsWithoutProfiles() {
        var user=service.user(account);
        assertEquals("owner@example.test",user.get("displayName"));
        assertFalse(user.containsKey("passwordHash"));
        assertFalse(user.containsKey("verificationToken"));
        assertEquals(1,service.users("owner","ACTIVE",0,20).totalElements());
        assertTrue(service.users("owner","SUSPENDED",0,20).content().isEmpty());
    }
    @Test void invalidRangesPaginationAndMissingDetailsAreRejected() {
        assertThrows(RuntimeException.class,()->service.statistics(day,day.minusDays(1)));
        assertThrows(RuntimeException.class,()->service.statistics(day.minusDays(366),day));
        assertThrows(RuntimeException.class,()->service.users("","",0,101));
        assertThrows(RuntimeException.class,()->service.payment(UUID.randomUUID()));
    }
}
