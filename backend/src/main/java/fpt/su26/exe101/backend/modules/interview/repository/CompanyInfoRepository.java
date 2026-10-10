package fpt.su26.exe101.backend.modules.interview.repository;

import fpt.su26.exe101.backend.modules.interview.entity.CompanyInfo;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyInfoRepository extends JpaRepository<CompanyInfo,UUID> {
    Optional<CompanyInfo> findFirstByCompanyNameIgnoreCase(String name);
}
