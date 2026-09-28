package fpt.su26.exe101.backend.modules.payment.repository;

import fpt.su26.exe101.backend.modules.payment.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByAccountId(UUID accountId);
    java.util.Optional<Order> findByTransactionId(String transactionId);
}
