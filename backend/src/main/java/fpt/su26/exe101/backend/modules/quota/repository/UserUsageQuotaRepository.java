package fpt.su26.exe101.backend.modules.quota.repository;

import fpt.su26.exe101.backend.modules.quota.entity.UserUsageQuota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserUsageQuotaRepository extends JpaRepository<UserUsageQuota, UUID> {
    Optional<UserUsageQuota> findByAccountId(UUID accountId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select q from UserUsageQuota q where q.accountId = :accountId")
    Optional<UserUsageQuota> findByAccountIdForUpdate(@Param("accountId") UUID accountId);
}
