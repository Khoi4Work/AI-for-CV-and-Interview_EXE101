package fpt.su26.exe101.backend.modules.feedback.service;
import fpt.su26.exe101.backend.base.service.CloudinaryService;

import fpt.su26.exe101.backend.modules.feedback.dto.request.FeedbackRequest;
import fpt.su26.exe101.backend.modules.feedback.entity.Feedback;
import fpt.su26.exe101.backend.modules.feedback.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public Feedback createFeedback(FeedbackRequest request, MultipartFile imageFile) throws IOException {
        boolean hasImage = imageFile != null && !imageFile.isEmpty();

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

        Feedback saved = feedbackRepository.save(feedback);
        log.info("[FEEDBACK] Submitted | feedbackId={} | category={} | attachmentPresent={}",
                saved.getId(), saved.getCategory(), hasImage);
        return saved;
    }

    public List<Feedback> getAllFeedbacks() {
        List<Feedback> all = feedbackRepository.findAll();
        return all;
    }

    /** Lấy 1 feedback theo id — 404 nếu không tồn tại. */
    public Feedback getFeedbackById(Long id) {
        return feedbackRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("[FEEDBACK] Record not found | feedbackId={}", id);
                    return new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Feedback not found: id=" + id);
                });
    }

    /** Lọc feedback theo category. */
    public List<Feedback> getFeedbacksByCategory(String category) {
        List<Feedback> list = feedbackRepository.findByCategoryOrderByCreatedAtDesc(category);
        return list;
    }

    @Transactional
    public void deleteFeedback(Long id) {
        if (!feedbackRepository.existsById(id)) {
            log.warn("[FEEDBACK] Delete target not found | feedbackId={}", id);
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Feedback not found: id=" + id);
        }
        feedbackRepository.deleteById(id);
        log.info("[FEEDBACK] Deleted | feedbackId={}", id);
    }
}
