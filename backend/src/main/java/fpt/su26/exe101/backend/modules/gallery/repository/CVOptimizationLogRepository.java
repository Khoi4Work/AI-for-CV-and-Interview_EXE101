package fpt.su26.exe101.backend.modules.gallery.repository;

import fpt.su26.exe101.backend.modules.gallery.entity.CVOptimizationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CVOptimizationLogRepository extends JpaRepository<CVOptimizationLog, UUID> {
    List<CVOptimizationLog> findByCvId(UUID cvId);
}
