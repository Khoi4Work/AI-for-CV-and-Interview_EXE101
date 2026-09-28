package fpt.su26.exe101.backend.modules.cv.repository;

import fpt.su26.exe101.backend.modules.cv.entity.CVOptimizationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CVOptimizationLogRepository extends JpaRepository<CVOptimizationLog, UUID> {
    List<CVOptimizationLog> findByCvId(UUID cvId);
}
