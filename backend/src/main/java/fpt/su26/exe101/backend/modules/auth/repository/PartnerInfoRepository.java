package fpt.su26.exe101.backend.modules.auth.repository;

import fpt.su26.exe101.backend.modules.auth.entity.PartnerInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PartnerInfoRepository extends JpaRepository<PartnerInfo, UUID> {
}
