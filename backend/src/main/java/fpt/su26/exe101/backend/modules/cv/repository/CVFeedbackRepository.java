package fpt.su26.exe101.backend.modules.cv.repository;

import fpt.su26.exe101.backend.modules.cv.entity.CV;
import fpt.su26.exe101.backend.modules.cv.entity.CVFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CVFeedbackRepository extends JpaRepository<CVFeedback, UUID> {
    Optional<CVFeedback> findByCvIdAndJobDescriptionId(UUID cvId, UUID jdId);
    Optional<CVFeedback> findByCv(CV cv);

}
