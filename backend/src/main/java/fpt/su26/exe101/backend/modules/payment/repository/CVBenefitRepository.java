package fpt.su26.exe101.backend.modules.payment.repository;

import fpt.su26.exe101.backend.modules.payment.entity.CVBenefit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CVBenefitRepository extends JpaRepository<CVBenefit, UUID> {
    CVBenefit findByServiceId(UUID serviceId);
}
