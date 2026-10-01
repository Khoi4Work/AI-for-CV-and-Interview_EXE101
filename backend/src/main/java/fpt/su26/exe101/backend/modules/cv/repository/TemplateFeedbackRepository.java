package fpt.su26.exe101.backend.modules.cv.repository;

import fpt.su26.exe101.backend.modules.cv.entity.TemplateFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface TemplateFeedbackRepository extends JpaRepository<TemplateFeedback, UUID> {
    List<TemplateFeedback> findByTemplateId(String templateId);
    List<TemplateFeedback> findByAccountId(UUID accountId);
}
