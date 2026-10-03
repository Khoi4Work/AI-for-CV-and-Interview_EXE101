package fpt.su26.exe101.backend.modules.payment.repository;

import fpt.su26.exe101.backend.modules.payment.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByAccountId(UUID accountId);
    @Query("select o from Order o left join fetch o.service where o.accountId = :accountId "
            + "order by coalesce(o.orderedAt, o.createdAt) desc, o.id desc")
    List<Order> findPaymentHistoryByAccountId(@Param("accountId") UUID accountId);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.transactionId = :transactionId")
    java.util.Optional<Order> findByTransactionIdForUpdate(@Param("transactionId") String transactionId);
}
