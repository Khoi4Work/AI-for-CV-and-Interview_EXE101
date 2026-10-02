package fpt.su26.exe101.backend.modules.auth.repository;

import fpt.su26.exe101.backend.modules.auth.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {
    @Query("select a from Account a where lower(a.email) = lower(:email)")
    Optional<Account> findByEmail(@Param("email") String email);
    @Query("select (count(a) > 0) from Account a where lower(a.email) = lower(:email)")
    boolean existsByEmail(@Param("email") String email);
    Optional<Account> findByVerificationToken(String token);
    Optional<Account> findByResetPasswordToken(String token);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Account a where lower(a.email) = lower(:email)")
    Optional<Account> findLockedByEmail(@Param("email") String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Account a where a.verificationToken = :token")
    Optional<Account> findLockedByVerificationToken(@Param("token") String token);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Account a where a.id = :id")
    Optional<Account> findLockedById(@Param("id") UUID id);

}
