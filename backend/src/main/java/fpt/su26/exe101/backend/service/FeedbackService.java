package fpt.su26.exe101.backend.service;

import fpt.su26.exe101.backend.dto.FeedbackRequest;
import fpt.su26.exe101.backend.entity.Feedback;
import fpt.su26.exe101.backend.repository.FeedbackRepository;
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
        log.info("Creating feedback: userName='{}', category='{}', contentLength={}, hasImage={}",
                request.getUserName(), request.getCategory(),
                request.getContent() == null ? 0 : request.getContent().length(),
                imageFile != null && !imageFile.isEmpty());

        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            log.info("Uploading attached image: name='{}', size={} bytes, contentType='{}'",
                    imageFile.getOriginalFilename(), imageFile.getSize(), imageFile.getContentType());
            try {
                imageUrl = cloudinaryService.uploadImage(imageFile);
                log.info("Image uploaded successfully: {}", imageUrl);
            } catch (IOException ex) {
                log.error("Failed to upload image to Cloudinary: {}", ex.getMessage(), ex);
                throw ex;
            }
        } else {
            log.debug("No image attached to feedback");
        }

        Feedback feedback = Feedback.builder()
                .userName(request.getUserName())
                .category(request.getCategory())
                .content(request.getContent())
                .imageUrl(imageUrl)
                .build();

        Feedback saved = feedbackRepository.save(feedback);
        log.info("Feedback saved: id={}, category='{}', imageUrl='{}'",
                saved.getId(), saved.getCategory(), saved.getImageUrl());
        return saved;
    }

    public List<Feedback> getAllFeedbacks() {
        log.debug("Fetching all feedbacks");
        List<Feedback> all = feedbackRepository.findAll();
        log.info("Fetched {} feedbacks", all.size());
        return all;
    }

    /** Lấy 1 feedback theo id — 404 nếu không tồn tại. */
    public Feedback getFeedbackById(Long id) {
        log.debug("Fetching feedback by id={}", id);
        return feedbackRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Feedback not found: id={}", id);
                    return new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Feedback not found: id=" + id);
                });
    }

    /** Lọc feedback theo category. */
    public List<Feedback> getFeedbacksByCategory(String category) {
        log.debug("Fetching feedbacks by category='{}'", category);
        List<Feedback> list = feedbackRepository.findByCategoryOrderByCreatedAtDesc(category);
        log.info("Fetched {} feedbacks for category='{}'", list.size(), category);
        return list;
    }

    @Transactional
    public void deleteFeedback(Long id) {
        log.info("Deleting feedback id={}", id);
        if (!feedbackRepository.existsById(id)) {
            log.warn("Delete failed — feedback not found: id={}", id);
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Feedback not found: id=" + id);
        }
        feedbackRepository.deleteById(id);
        log.info("Feedback deleted: id={}", id);
    }
}
