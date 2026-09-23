package fpt.su26.exe101.backend.modules.auth.repository;

import fpt.su26.exe101.backend.modules.auth.entity.*;
import fpt.su26.exe101.backend.modules.auth.entity.enums.AccountRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class AuthRepositoryIntegrationTest {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private AccountProviderRepository accountProviderRepository;

    @Test
    void testAccountCRUD() {
        Account account = Account.builder()
                .email("test@example.com")
                .passwordHash("hashed_password")
                .role(AccountRole.ATTENDANCE)
                .status("ACTIVE")
                .build();

        Account savedAccount = accountRepository.save(account);
        assertThat(savedAccount.getId()).isNotNull();

        Optional<Account> foundAccount = accountRepository.findById(savedAccount.getId());
        assertThat(foundAccount).isPresent();
        assertThat(foundAccount.get().getEmail()).isEqualTo("test@example.com");
    }

    @Test
    void testDuplicateEmailThrowsException() {
        Account account1 = Account.builder()
                .email("duplicate@example.com")
                .passwordHash("hash1")
                .role(AccountRole.ATTENDANCE)
                .build();
        accountRepository.save(account1);

        Account account2 = Account.builder()
                .email("duplicate@example.com")
                .passwordHash("hash2")
                .role(AccountRole.ATTENDANCE)
                .build();

        assertThrows(DataIntegrityViolationException.class, () -> {
            accountRepository.saveAndFlush(account2);
        });
    }

    @Test
    void testTokenCRUDAndUniqueConstraint() {
        Account account = Account.builder()
                .email("token@example.com")
                .passwordHash("hash")
                .role(AccountRole.ATTENDANCE)
                .build();
        accountRepository.save(account);

        Token token1 = Token.builder()
                .account(account)
                .refreshToken("token1")
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();
        tokenRepository.save(token1);

        Token token2 = Token.builder()
                .account(account)
                .refreshToken("token2")
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();

        assertThrows(DataIntegrityViolationException.class, () -> {
            tokenRepository.saveAndFlush(token2);
        });
    }

    @Test
    void testAttendanceCRUDAndUniqueConstraint() {
        Account account = Account.builder()
                .email("att@example.com")
                .passwordHash("hash")
                .role(AccountRole.ATTENDANCE)
                .build();
        accountRepository.save(account);

        Attendance attendance1 = Attendance.builder()
                .account(account)
                .displayName("User 1")
                .build();
        attendanceRepository.save(attendance1);

        Attendance attendance2 = Attendance.builder()
                .account(account)
                .displayName("User 2")
                .build();

        assertThrows(DataIntegrityViolationException.class, () -> {
            attendanceRepository.saveAndFlush(attendance2);
        });
    }

    @Test
    void testAccountProviderForeignKey() {
        Account account = Account.builder()
                .email("prov@example.com")
                .passwordHash("hash")
                .role(AccountRole.ATTENDANCE)
                .build();
        accountRepository.save(account);

        AccountProvider provider = AccountProvider.builder()
                .account(account)
                .providerName("Google")
                .providerId("google_id_123")
                .build();

        AccountProvider savedProvider = accountProviderRepository.save(provider);
        assertThat(savedProvider.getId()).isNotNull();
        assertThat(savedProvider.getAccount().getEmail()).isEqualTo("prov@example.com");
    }
}
