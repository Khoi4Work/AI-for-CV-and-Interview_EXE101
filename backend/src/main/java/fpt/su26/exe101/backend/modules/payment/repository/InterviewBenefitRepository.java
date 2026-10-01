package fpt.su26.exe101.backend.modules.payment.repository;

import fpt.su26.exe101.backend.modules.payment.entity.InterviewBenefit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InterviewBenefitRepository extends JpaRepository<InterviewBenefit, UUID> {
    InterviewBenefit findByServiceId(UUID serviceId);
}
