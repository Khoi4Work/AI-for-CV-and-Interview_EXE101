package fpt.su26.exe101.backend.modules.auth.repository;

import fpt.su26.exe101.backend.modules.auth.entity.CompanyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyMemberRepository extends JpaRepository<CompanyMember, UUID> {
    Optional<CompanyMember> findByPartnerIdAndCompanyId(UUID accountId, UUID companyId);
}
