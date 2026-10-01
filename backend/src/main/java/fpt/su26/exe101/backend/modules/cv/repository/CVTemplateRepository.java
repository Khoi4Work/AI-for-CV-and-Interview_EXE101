package fpt.su26.exe101.backend.modules.cv.repository;

import fpt.su26.exe101.backend.modules.cv.entity.CVTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface CVTemplateRepository extends JpaRepository<CVTemplate, String> {
}
