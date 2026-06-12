package fpt.su26.exe101.backend.repository;

import fpt.su26.exe101.backend.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    /** Lấy tất cả feedback thuộc một category, mới nhất trước. */
    List<Feedback> findByCategoryOrderByCreatedAtDesc(String category);
}
