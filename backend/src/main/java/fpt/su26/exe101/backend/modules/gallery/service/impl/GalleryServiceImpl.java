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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
    public void createGalleryForAccount(UUID accountId) {
        if (galleryRepository.findByAccountId(accountId).isPresent()) {
            log.info("Gallery already exists for account: {}", accountId);
            return;
        }
        Gallery gallery = Gallery.builder()
                .accountId(accountId)
                .build();
        galleryRepository.save(gallery);
        log.info("Created new gallery for account: {}", accountId);
    }

    @Override
    public JobDescription findJobDescription(UUID id, Gallery gallery) {
        return jdRepository.findById(id)
                .filter(jd -> jd.getGallery().getId().equals(gallery.getId()))
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Job Description not found"));
    }

    @Override
    @Transactional
    public JobDescription findOrCreateJobDescription(String jdText, Gallery gallery) {
        if (jdText == null || jdText.isBlank()) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "JD text must not be blank.");
        }
        String normalized = jdText.trim().replaceAll("\\s+", " ");
        String hash;
        try {
            hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(normalized.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is unavailable", e);
        }
        return jdRepository.findByGalleryIdAndContentHash(gallery.getId(), hash).orElseGet(() ->
                jdRepository.save(JobDescription.builder().gallery(gallery).title("User provided JD")
                        .content(jdText.trim()).contentHash(hash).build()));
    }

    @Override
    public List<JDResponseDTO> getJobDescriptionsForCurrentGallery() {
        Gallery gallery = getGalleryForCurrentUser();
        List<JobDescription> jds = jdRepository.findByGalleryId(gallery.getId());
        return galleryMapper.jdsToJDResponses(jds);
    }

    @Override
    @Transactional
    public JDResponseDTO createJobDescription(JDCreateRequestDTO request) {
        Gallery gallery = getGalleryForCurrentUser();

        JobDescription jd = JobDescription.builder()
                .gallery(gallery)
                .title(request.getTitle())
                .content(request.getContent())
                .companyName(request.getCompanyName())
                .build();

        JobDescription savedJd = jdRepository.save(jd);
        return galleryMapper.jdToJDResponse(savedJd);
    }

    @Override
    @Transactional
    public JDResponseDTO updateJobDescription(UUID id, JDUpdateRequestDTO request) {
        JobDescription jd = jdRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Job Description not found"));

        Gallery gallery = getGalleryForCurrentUser();
        if (!jd.getGallery().getId().equals(gallery.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION);
        }

        jd.setTitle(request.getTitle());
        jd.setContent(request.getContent());
        jd.setCompanyName(request.getCompanyName());

        return galleryMapper.jdToJDResponse(jdRepository.save(jd));
    }

    @Override
    @Transactional
    public void deleteJobDescription(UUID id) {
        JobDescription jd = jdRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Job Description not found"));

        Gallery gallery = getGalleryForCurrentUser();
        if (!jd.getGallery().getId().equals(gallery.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION);
        }

        jdRepository.delete(jd);
    }

}
