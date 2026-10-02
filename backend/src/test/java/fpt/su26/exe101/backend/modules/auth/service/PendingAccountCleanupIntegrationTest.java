package fpt.su26.exe101.backend.modules.auth.service;

import fpt.su26.exe101.backend.modules.quota.config.QuotaBenefitConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.autoconfigure.AutoConfigurationPackage;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/** Executes the actual SQL against a relational schema generated from production entities. */
@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:pending_cleanup;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.show-sql=false"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ContextConfiguration(classes = PendingAccountCleanupIntegrationTest.Config.class)
@Import({PendingAccountCleanupService.class, QuotaBenefitConfig.class})
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class PendingAccountCleanupIntegrationTest {
    @Configuration
    @AutoConfigurationPackage
    @EntityScan("fpt.su26.exe101.backend.modules")
    static class Config {}

    @Autowired JdbcTemplate jdbc;
    @Autowired PendingAccountCleanupService service;
    private final LocalDateTime now = LocalDateTime.of(2026, 10, 3, 3, 0);

    private UUID createShell() {
        UUID id = UUID.randomUUID(), attendance = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO account (id,created_at,updated_at,email,provider,role,status,verification_managed_at)
                VALUES (?,?,?,?, 'LOCAL','ATTENDANCE','PENDING_VERIFICATION',?)
                """, id, now.minusDays(3), now.minusDays(3), id + "@example.test", now.minusDays(3));
        jdbc.update("INSERT INTO attendance (id,created_at,account_id,display_name) VALUES (?,?,?,?)",
                attendance, now.minusDays(3), id, "Registrant");
        jdbc.update("INSERT INTO attendance_info (id,created_at,attendance_id) VALUES (?,?,?)",
                UUID.randomUUID(), now.minusDays(3), attendance);
        jdbc.update("INSERT INTO gallery (id,created_at,account_id) VALUES (?,?,?)",
                UUID.randomUUID(), now.minusDays(3), id);
        jdbc.update("""
                INSERT INTO user_usage_quotas (id,created_at,account_id,remaining_cv_cnt,remaining_cv_ai_cnt,
                    remaining_int_min,cv_plan,interview_plan,cv_expiry_email_sent,interview_expiry_email_sent)
                VALUES (?,?,?,1,1,0,'FREE','FREE',false,false)
                """, UUID.randomUUID(), now.minusDays(3), id);
        jdbc.update("""
                INSERT INTO verification_mail_outbox (id,created_at,account_id,token_hash,attempts,next_attempt_at,canceled)
                VALUES (?,?,?, ?,0,?,true)
                """, UUID.randomUUID(), now.minusDays(3), id, "a".repeat(64), now.minusDays(2));
        return id;
    }

    private int accountCount(UUID id) {
        return jdbc.queryForObject("SELECT count(*) FROM account WHERE id=?", Integer.class, id);
    }

    @Test
    void actuallyDeletesAnUnusedShellAndItsDefaultDependents() {
        UUID id = createShell();
        UUID attendance = jdbc.queryForObject("SELECT id FROM attendance WHERE account_id=?", UUID.class, id);
        assertEquals(PendingAccountCleanupService.Result.DELETED, service.cleanAccount(id, now, false));
        assertEquals(0, accountCount(id));
        for (String table : new String[]{"attendance", "gallery", "user_usage_quotas", "verification_mail_outbox"}) {
            assertEquals(0, jdbc.queryForObject("SELECT count(*) FROM " + table + " WHERE account_id=?", Integer.class, id));
        }
        assertEquals(0, jdbc.queryForObject("SELECT count(*) FROM attendance_info WHERE attendance_id=?", Integer.class, attendance));
    }

    @Test
    void realTokenAndCvRelationsProtectAccounts() {
        UUID tokenAccount = createShell();
        jdbc.update("INSERT INTO token (id,created_at,account_id,refresh_token,expires_at) VALUES (?,?,?,?,?)",
                UUID.randomUUID(), now.minusDays(1), tokenAccount, "test-refresh", now.plusDays(1));
        assertEquals(PendingAccountCleanupService.Result.SKIPPED, service.cleanAccount(tokenAccount, now, false));
        assertEquals(1, accountCount(tokenAccount));

        UUID cvAccount = createShell();
        UUID gallery = jdbc.queryForObject("SELECT id FROM gallery WHERE account_id=?", UUID.class, cvAccount);
        jdbc.update("INSERT INTO cvs (id,created_at,gallery_id,name,content) VALUES (?,?,?,?,'{}')",
                UUID.randomUUID(), now.minusDays(1), gallery, "Existing CV");
        assertEquals(PendingAccountCleanupService.Result.SKIPPED, service.cleanAccount(cvAccount, now, false));
        assertEquals(1, accountCount(cvAccount));
    }

    @Test
    void ordersAndChangedQuotasProtectAccounts() {
        UUID orderAccount = createShell(), paymentService = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO payment_services (id,created_at,name,category,package_code,price,billing_units)
                VALUES (?,?,'Test service','CV','MIDDLE',39000,1)
                """, paymentService, now);
        jdbc.update("""
                INSERT INTO orders (id,created_at,account_id,service_id,amount,status,payment_status)
                VALUES (?,?,?,?,39000,'COMPLETED','PAID')
                """, UUID.randomUUID(), now, orderAccount, paymentService);
        assertEquals(PendingAccountCleanupService.Result.SKIPPED, service.cleanAccount(orderAccount, now, false));
        assertEquals(1, accountCount(orderAccount));
        UUID quotaAccount = createShell();
        jdbc.update("UPDATE user_usage_quotas SET remaining_cv_cnt=0 WHERE account_id=?", quotaAccount);
        assertEquals(PendingAccountCleanupService.Result.SKIPPED, service.cleanAccount(quotaAccount, now, false));
        assertEquals(1, accountCount(quotaAccount));
    }

    @Test
    void actualQueryHonorsRetentionRecentResendAndDryRun() {
        UUID id = createShell();
        assertTrue(service.findCandidates(now, null, 100).contains(id));
        assertEquals(PendingAccountCleanupService.Result.WOULD_DELETE, service.cleanAccount(id, now, true));
        assertEquals(1, accountCount(id));
        jdbc.update("UPDATE account SET verification_last_sent_at=? WHERE id=?", now.minusHours(23), id);
        assertFalse(service.findCandidates(now, null, 100).contains(id));
        assertEquals(PendingAccountCleanupService.Result.SKIPPED, service.cleanAccount(id, now, false));
        jdbc.update("UPDATE account SET verification_last_sent_at=null, verification_managed_at=? WHERE id=?", now.minusDays(1), id);
        assertFalse(service.findCandidates(now, null, 100).contains(id));
    }

    @Test
    void statusChangeAfterCandidateSelectionPreservesVerifiedAccount() {
        UUID id = createShell();
        assertTrue(service.findCandidates(now, null, 100).contains(id));
        jdbc.update("UPDATE account SET status='ACTIVE', verified_at=? WHERE id=?", now, id);
        assertEquals(PendingAccountCleanupService.Result.SKIPPED, service.cleanAccount(id, now, false));
        assertEquals(1, accountCount(id));
    }

    @Test
    void unknownForeignKeyRollsBackAllDependentDeletions() {
        UUID id = createShell();
        jdbc.execute("CREATE TABLE cleanup_future_dependency (id uuid PRIMARY KEY, account_id uuid REFERENCES account(id))");
        try {
            jdbc.update("INSERT INTO cleanup_future_dependency VALUES (?,?)", UUID.randomUUID(), id);
            assertThrows(RuntimeException.class, () -> service.cleanAccount(id, now, false));
            assertEquals(1, accountCount(id));
            for (String table : new String[]{"attendance", "gallery", "user_usage_quotas", "verification_mail_outbox"}) {
                assertEquals(1, jdbc.queryForObject("SELECT count(*) FROM " + table + " WHERE account_id=?", Integer.class, id));
            }
        } finally {
            jdbc.execute("DROP TABLE cleanup_future_dependency");
        }
    }
}
