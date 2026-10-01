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
            log.warn("Upload failed: file is null or empty");
            throw new IllegalArgumentException("File cannot be empty");
        }

        try {
            log.info("Uploading file {} to Cloudinary... (Size: {} bytes)", 
                     file.getOriginalFilename(), file.getSize());
            
            // Mocking a Cloudinary URL response
            String mockUrl = "https://res.cloudinary.com/demo/image/upload/v12345678/" + file.getOriginalFilename();
            
            log.info("Upload successful. URL: {}", mockUrl);
            return mockUrl;
        } catch (Exception e) {
            log.error("Cloudinary upload error: {}", e.getMessage());
            throw new RuntimeException("Failed to upload image to Cloudinary");
        }
    }
}
