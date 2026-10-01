package fpt.su26.exe101.backend.modules.auth.repository;

import fpt.su26.exe101.backend.modules.auth.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {
    Optional<Account> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<Account> findByVerificationToken(String token);
    Optional<Account> findByResetPasswordToken(String token);

    @Modifying
    @Query("UPDATE Account a SET a.status = :status, a.verificationToken = null WHERE a.verificationToken = :token")
    int verifyEmailToken(@Param("token") String token, @Param("status") String status);
}
