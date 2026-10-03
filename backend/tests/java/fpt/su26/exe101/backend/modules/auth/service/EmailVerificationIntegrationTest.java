package fpt.su26.exe101.backend.modules.auth.service;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.modules.auth.entity.*;
import fpt.su26.exe101.backend.modules.auth.entity.enums.*;
import fpt.su26.exe101.backend.modules.auth.entity.enums.AccountProvider;
import fpt.su26.exe101.backend.modules.auth.repository.*;
import fpt.su26.exe101.backend.modules.gallery.repository.GalleryRepository;
import fpt.su26.exe101.backend.modules.gallery.mapper.GalleryMapper;
import fpt.su26.exe101.backend.modules.gallery.listener.AccountCreatedListener;
import fpt.su26.exe101.backend.modules.gallery.service.impl.GalleryServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfigurationPackage;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.*;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.transaction.*;
import org.springframework.transaction.annotation.*;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.test.mock.mockito.MockBean;
import java.time.LocalDateTime;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:email_verification;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect", "spring.jpa.show-sql=false"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ContextConfiguration(classes = EmailVerificationIntegrationTest.Config.class)
@Import({EmailVerificationService.class, VerificationRateLimiter.class, AccountCreatedListener.class, GalleryServiceImpl.class})
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class EmailVerificationIntegrationTest {
    @Configuration @AutoConfigurationPackage
    @EntityScan("fpt.su26.exe101.backend.modules")
    @EnableJpaRepositories(basePackageClasses = {AccountRepository.class, GalleryRepository.class})
    static class Config {}
    @Autowired AccountRepository accounts;
    @Autowired VerificationMailOutboxRepository outbox;
    @Autowired EmailVerificationService service;
    @Autowired PlatformTransactionManager transactions;
    @Autowired JdbcTemplate jdbc;
    @MockBean GalleryMapper galleryMapper;

    private Account pending() {
        return new TransactionTemplate(transactions).execute(tx -> {
            Account a = accounts.save(Account.builder().email(UUID.randomUUID() + "@example.test")
                    .provider(AccountProvider.LOCAL).role(AccountRole.ATTENDANCE).status("PENDING_VERIFICATION").build());
            service.issue(a);
            return a;
        });
    }

    private String rawToken(UUID id) {
        return jdbc.queryForObject("select token from verification_mail_outbox where account_id=? and canceled=false", String.class, id);
    }

    @Test void committedIssuanceProducesMailAndVerificationIsSingleUse() {
        Account account = pending();
        String token = rawToken(account.getId());
        assertNotEquals(token, accounts.findById(account.getId()).orElseThrow().getVerificationToken());
        service.verify(token);
        assertEquals("ACTIVE", accounts.findById(account.getId()).orElseThrow().getStatus());
        assertThrows(ApiException.class, () -> service.verify(token));
        assertEquals(0, jdbc.queryForObject("select count(*) from verification_mail_outbox where account_id=? and token is not null", Integer.class, account.getId()));
    }

    @Test void reissuanceInvalidatesOldTokenAndErasesOldMail() {
        Account account = pending();
        String old = rawToken(account.getId());
        new TransactionTemplate(transactions).executeWithoutResult(tx -> service.issue(accounts.findLockedById(account.getId()).orElseThrow()));
        String fresh = rawToken(account.getId());
        assertNotEquals(old, fresh);
        assertThrows(ApiException.class, () -> service.verify(old));
        service.verify(fresh);
        assertEquals("ACTIVE", accounts.findById(account.getId()).orElseThrow().getStatus());
    }

    @Test void expiredTokenCannotChangeState() {
        Account account = pending();
        String token = rawToken(account.getId());
        jdbc.update("update account set verification_expires_at=? where id=?", LocalDateTime.now().minusSeconds(1), account.getId());
        assertThrows(ApiException.class, () -> service.verify(token));
        assertEquals("PENDING_VERIFICATION", accounts.findById(account.getId()).orElseThrow().getStatus());
    }

    @Test void rollbackDoesNotLeaveAccountOrMailToDeliver() {
        UUID[] id = new UUID[1];
        assertThrows(IllegalStateException.class, () -> new TransactionTemplate(transactions).executeWithoutResult(tx -> {
            Account a = accounts.save(Account.builder().email(UUID.randomUUID() + "@example.test")
                    .provider(AccountProvider.LOCAL).role(AccountRole.ATTENDANCE).status("PENDING_VERIFICATION").build());
            id[0] = a.getId();
            service.issue(a);
            throw new IllegalStateException("Simulated registration rollback");
        }));
        assertFalse(accounts.existsById(id[0]));
        assertEquals(0, jdbc.queryForObject("select count(*) from verification_mail_outbox where account_id=?", Integer.class, id[0]));
    }

    @Test void legacyCaseEmailCanResendAndDatabaseCooldownSurvivesNewLimiter() {
        Account account = pending();
        String original = rawToken(account.getId());
        jdbc.update("update account set email=? where id=?", account.getEmail().toUpperCase(Locale.ROOT), account.getId());
        service.resend(account.getEmail(), "127.0.0.1");
        assertEquals(original, rawToken(account.getId()));
        assertTrue(accounts.existsByEmail(account.getEmail()));
    }

    @Test void activeAccountWithLeftoverTokenCannotBeReverified() {
        Account account = pending();
        String token = rawToken(account.getId());
        jdbc.update("update account set status='ACTIVE' where id=?", account.getId());
        assertThrows(ApiException.class, () -> service.verify(token));
    }

    @Test void galleryIsProvisionedOnlyAfterVerificationCommitAndReplayDoesNotDuplicateIt() {
        Account account = pending();
        assertEquals(0, jdbc.queryForObject("select count(*) from gallery where account_id=?", Integer.class, account.getId()));
        String token = rawToken(account.getId());
        service.verify(token);
        assertEquals(1, jdbc.queryForObject("select count(*) from gallery where account_id=?", Integer.class, account.getId()));
        assertThrows(ApiException.class, () -> service.verify(token));
        assertEquals(1, jdbc.queryForObject("select count(*) from gallery where account_id=?", Integer.class, account.getId()));
    }
}
