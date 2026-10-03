package fpt.su26.exe101.backend.base.service;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CloudinaryService {
    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);

    /**
     * Mock implementation of Cloudinary upload.
     * In production, this will use the Cloudinary SDK to upload the file.
     */
    public String uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            log.warn("[ASSET] Image upload rejected | reason=empty_file");
            throw new IllegalArgumentException("File cannot be empty");
        }

        try {
            log.info("[ASSET] Image upload started | provider=cloudinary_mock | sizeBytes={} | contentType={}",
                    file.getSize(), file.getContentType());
            
            // Mocking a Cloudinary URL response
            String mockUrl = "https://res.cloudinary.com/demo/image/upload/v12345678/" + file.getOriginalFilename();
            
            log.info("[ASSET] Image upload completed | provider=cloudinary_mock | sizeBytes={}", file.getSize());
            return mockUrl;
        } catch (Exception e) {
            log.error("[ASSET] Image upload failed | provider=cloudinary_mock | errorType={}",
                    e.getClass().getSimpleName(), e);
            throw new RuntimeException("Failed to upload image to Cloudinary");
        }
    }
}
