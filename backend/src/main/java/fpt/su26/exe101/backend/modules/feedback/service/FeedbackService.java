package fpt.su26.exe101.backend.modules.feedback.service;

import fpt.su26.exe101.backend.modules.feedback.dto.request.FeedbackRequest;
import fpt.su26.exe101.backend.modules.feedback.entity.Feedback;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface FeedbackService {
    Feedback createFeedback(FeedbackRequest request, MultipartFile imageFile) throws IOException;

    List<Feedback> getAllFeedbacks();

    Feedback getFeedbackById(Long id);

    List<Feedback> getFeedbacksByCategory(String category);

    void deleteFeedback(Long id);
}
