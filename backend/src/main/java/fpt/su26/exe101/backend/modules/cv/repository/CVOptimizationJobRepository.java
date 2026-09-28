package fpt.su26.exe101.backend.modules.cv.repository;

import fpt.su26.exe101.backend.modules.cv.entity.CVOptimizationJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CVOptimizationJobRepository extends JpaRepository<CVOptimizationJob, Long> {
    Optional<CVOptimizationJob> findByJobId(String jobId);
}
