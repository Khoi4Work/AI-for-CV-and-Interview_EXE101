package fpt.su26.exe101.backend.modules.gallery.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.auth.repository.AccountRepository;
import fpt.su26.exe101.backend.modules.auth.entity.Account;
import fpt.su26.exe101.backend.modules.gallery.dto.request.JDCreateRequestDTO;
import fpt.su26.exe101.backend.modules.gallery.dto.request.JDUpdateRequestDTO;
import fpt.su26.exe101.backend.modules.gallery.dto.response.JDResponseDTO;
import fpt.su26.exe101.backend.modules.gallery.entity.*;
import fpt.su26.exe101.backend.modules.gallery.mapper.GalleryMapper;
import fpt.su26.exe101.backend.modules.gallery.repository.GalleryRepository;
import fpt.su26.exe101.backend.modules.gallery.repository.JobDescriptionRepository;
import fpt.su26.exe101.backend.modules.gallery.entity.enums.JobDescriptionSource;
import fpt.su26.exe101.backend.modules.gallery.service.JobDescriptionTitleExtractor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import java.util.List;
import java.util.UUID;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
@Slf4j
public class GalleryServiceImpl implements fpt.su26.exe101.backend.modules.gallery.service.GalleryService {
    private final GalleryRepository galleryRepository;
    private final JobDescriptionRepository jdRepository;
    private final GalleryMapper galleryMapper;
    private final AccountRepository accountRepository;
    private final JobDescriptionTitleExtractor jobDescriptionTitleExtractor;

    private Gallery getGalleryForCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        return galleryRepository.findByAccountId(account.getId())
                .orElseGet(() -> {
                    Gallery gallery = Gallery.builder()
                            .accountId(account.getId())
                            .build();
                    return galleryRepository.save(gallery);
                });
    }

    @Override
    public Gallery getCurrentGallery() {
        return getGalleryForCurrentUser();
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createGalleryForAccount(UUID accountId) {
        if (galleryRepository.findByAccountId(accountId).isPresent()) {
            log.debug("[GALLERY] Creation skipped | accountId={} | reason=already_exists", accountId);
            return;
        }
        Gallery gallery = Gallery.builder()
                .accountId(accountId)
                .build();
        galleryRepository.save(gallery);
        log.info("[GALLERY] Created | accountId={} | galleryId={}", accountId, gallery.getId());
    }

    @Override
    public JobDescription findJobDescription(UUID id, Gallery gallery) {
        return jdRepository.findById(id)
                .filter(jd -> jd.getSource() == JobDescriptionSource.USER
                        && jd.getGallery() != null && jd.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Job Description not found"));
    }

    @Override
    @Transactional
    public JobDescription findOrCreateJobDescription(String jdText, Gallery gallery) {
        if (jdText == null || jdText.isBlank()) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "JD text must not be blank.");
        }
        String hash = contentHash(jdText);
        JobDescription jd = jdRepository.findByGalleryIdAndContentHash(gallery.getId(), hash).orElse(null);
        if (jd != null) {
            if (isGenericTitle(jd.getTitle())) {
                jd.setTitle(extractTitleOrFallback(jd.getContent()));
            }
            if (!jd.isActive()) jd.setActive(true);
            return jdRepository.save(jd);
        }
        return jdRepository.save(JobDescription.builder().gallery(gallery).source(JobDescriptionSource.USER)
                .title(extractTitleOrFallback(jdText)).content(jdText.trim()).contentHash(hash).build());
    }

    @Override
    @Transactional
    public List<JDResponseDTO> getJobDescriptionsForCurrentGallery() {
        Gallery gallery = getGalleryForCurrentUser();
        List<JobDescription> jds = jdRepository.findByGalleryId(gallery.getId()).stream()
                .filter(jd -> jd.getSource() == JobDescriptionSource.USER && jd.isActive()).toList();
        List<JobDescription> missingTitles = jds.stream().filter(jd -> isGenericTitle(jd.getTitle())).toList();
        missingTitles.forEach(jd -> jd.setTitle(extractTitleOrFallback(jd.getContent())));
        if (!missingTitles.isEmpty()) jdRepository.saveAll(missingTitles);
        return galleryMapper.jdsToJDResponses(jds);
    }

    @Override
    @Transactional
    public JDResponseDTO createJobDescription(JDCreateRequestDTO request) {
        Gallery gallery = getGalleryForCurrentUser();

        JobDescription jd = JobDescription.builder()
                .gallery(gallery)
                .source(JobDescriptionSource.USER)
                .title(specificTitleOrExtract(request.getTitle(), request.getContent()))
                .content(request.getContent())
                .companyName(request.getCompanyName())
                .build();

        JobDescription savedJd = jdRepository.save(jd);
        log.info("[GALLERY] Job description created | galleryId={} | jdId={}",
                gallery.getId(), savedJd.getId());
        return galleryMapper.jdToJDResponse(savedJd);
    }

    @Override
    @Transactional
    public JDResponseDTO updateJobDescription(UUID id, JDUpdateRequestDTO request) {
        if (request == null || request.getTitle() == null || request.getTitle().isBlank()
                || request.getContent() == null || request.getContent().isBlank()) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "JD title and content must not be blank.");
        }
        JobDescription jd = jdRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Job Description not found"));

        Gallery gallery = getGalleryForCurrentUser();
        if (jd.getSource() != JobDescriptionSource.USER || jd.getGallery() == null
                || !jd.getGallery().getId().equals(gallery.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION);
        }

        String updatedContentHash = contentHash(request.getContent());
        jdRepository.findByGalleryIdAndContentHash(gallery.getId(), updatedContentHash)
                .filter(existing -> !existing.getId().equals(jd.getId()))
                .ifPresent(existing -> {
                    throw new ApiException(ErrorCode.INVALID_INPUT,
                            "Một JD khác trong danh sách đã có nội dung này.");
                });
        jd.setTitle(request.getTitle().trim());
        jd.setContent(request.getContent().trim());
        jd.setContentHash(updatedContentHash);
        jd.setCompanyName(request.getCompanyName() == null || request.getCompanyName().isBlank()
                ? null : request.getCompanyName().trim());

        JobDescription updatedJd = jdRepository.save(jd);
        log.info("[GALLERY] Job description updated | galleryId={} | jdId={}",
                gallery.getId(), updatedJd.getId());
        return galleryMapper.jdToJDResponse(updatedJd);
    }

    @Override
    @Transactional
    public void deleteJobDescription(UUID id) {
        JobDescription jd = jdRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Job Description not found"));

        Gallery gallery = getGalleryForCurrentUser();
        if (jd.getSource() != JobDescriptionSource.USER || jd.getGallery() == null
                || !jd.getGallery().getId().equals(gallery.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION);
        }

        jd.setActive(false);
        jdRepository.save(jd);
        log.info("[GALLERY] Job description hidden | galleryId={} | jdId={}", gallery.getId(), id);
    }

    private String specificTitleOrExtract(String requestedTitle, String content) {
        if (requestedTitle != null && !requestedTitle.isBlank() && !isGenericTitle(requestedTitle)) {
            return requestedTitle.trim();
        }
        return extractTitleOrFallback(content);
    }

    private String extractTitleOrFallback(String content) {
        String extracted = jobDescriptionTitleExtractor.extractTitle(content);
        return extracted.isBlank() ? "JD chưa có tiêu đề" : extracted;
    }

    private String contentHash(String content) {
        String normalized = content.trim().replaceAll("\\s+", " ");
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(normalized.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private boolean isGenericTitle(String title) {
        if (title == null || title.isBlank()) return true;
        return title.trim().equalsIgnoreCase("User provided JD")
                || title.trim().equalsIgnoreCase("JD do người dùng cung cấp");
    }

}
