package fpt.su26.exe101.backend.modules.auth.repository;

import fpt.su26.exe101.backend.modules.auth.entity.VerificationMailOutbox;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import java.util.*;
import java.time.LocalDateTime;

public interface VerificationMailOutboxRepository extends JpaRepository<VerificationMailOutbox, UUID> {
    @Query("select count(m) from VerificationMailOutbox m where m.account.id = :accountId and m.createdAt > :since")
    long countRecent(@Param("accountId") UUID accountId, @Param("since") LocalDateTime since);
    @Query("select m.id from VerificationMailOutbox m where m.sentAt is null and m.canceled = false and m.nextAttemptAt <= :now order by m.nextAttemptAt")
    List<UUID> findDueIds(@Param("now") LocalDateTime now, Pageable pageable);

    @Modifying
    @Query("update VerificationMailOutbox m set m.canceled = true, m.token = null where m.account.id = :accountId and m.sentAt is null")
    void cancelPending(@Param("accountId") UUID accountId);
}
