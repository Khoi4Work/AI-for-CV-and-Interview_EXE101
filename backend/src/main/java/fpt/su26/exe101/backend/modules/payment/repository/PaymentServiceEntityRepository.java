package fpt.su26.exe101.backend.modules.payment.repository;

import fpt.su26.exe101.backend.modules.payment.entity.PaymentServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentServiceEntityRepository extends JpaRepository<PaymentServiceEntity, UUID> {
    List<PaymentServiceEntity> findByCategory(PaymentServiceEntity.ServiceCategory category);
}
