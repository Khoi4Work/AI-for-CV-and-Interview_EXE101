package fpt.su26.exe101.backend.service;

import fpt.su26.exe101.backend.dto.FeedbackRequest;
import fpt.su26.exe101.backend.entity.Feedback;
import fpt.su26.exe101.backend.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public Feedback createFeedback(FeedbackRequest request, MultipartFile imageFile) throws IOException {
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(imageFile);
        }

        Feedback feedback = Feedback.builder()
                .userName(request.getUserName())
                .category(request.getCategory())
                .content(request.getContent())
                .imageUrl(imageUrl)
                .build();

        return feedbackRepository.save(feedback);
    }

    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAll();
    }

    /** Lấy 1 feedback theo id — 404 nếu không tồn tại. */
    public Feedback getFeedbackById(Long id) {
        return feedbackRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Feedback not found: id=" + id));
    }

    /** Lọc feedback theo category. */
    public List<Feedback> getFeedbacksByCategory(String category) {
        return feedbackRepository.findByCategoryOrderByCreatedAtDesc(category);
    }

    @Transactional
    public void deleteFeedback(Long id) {
        if (!feedbackRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Feedback not found: id=" + id);
        }
        feedbackRepository.deleteById(id);
    }
}
