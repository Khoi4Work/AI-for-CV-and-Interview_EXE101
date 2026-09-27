package fpt.su26.exe101.backend.modules.gallery.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.auth.repository.AccountRepository;
import fpt.su26.exe101.backend.modules.auth.entity.Account;
import fpt.su26.exe101.backend.modules.gallery.dto.*;
import fpt.su26.exe101.backend.modules.gallery.entity.*;
import fpt.su26.exe101.backend.modules.gallery.mapper.GalleryMapper;
import fpt.su26.exe101.backend.modules.gallery.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GalleryServiceImpl implements fpt.su26.exe101.backend.modules.gallery.service.GalleryService {
    private final GalleryRepository galleryRepository;
    private final CVRepository cvRepository;
    private final JobDescriptionRepository jdRepository;
    private final InterviewSessionRepository interviewSessionRepository;
    private final InterviewAnswerRepository interviewAnswerRepository;
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
    public GalleryAssetsResponseDTO getGalleryAssets() {
        Gallery gallery = getGalleryForCurrentUser();

        List<CV> cvs = cvRepository.findByGalleryId(gallery.getId());
        List<JobDescription> jds = jdRepository.findByGalleryId(gallery.getId());

        return GalleryAssetsResponseDTO.builder()
                .cvs(galleryMapper.cvsToCVResponses(cvs))
                .jds(galleryMapper.jdsToJDResponses(jds))
                .build();
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

    @Override
    @Transactional
    public void deleteCV(UUID cvId) {
        CV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "CV not found"));

        Gallery gallery = getGalleryForCurrentUser();
        if (!cv.getGallery().getId().equals(gallery.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION);
        }

        cvRepository.delete(cv);
    }

    @Override
    public List<InterviewSessionResponseDTO> getInterviewHistory() {
        Gallery gallery = getGalleryForCurrentUser();
        List<InterviewSession> sessions = interviewSessionRepository.findByGallery(gallery);
        return galleryMapper.sessionsToSessionResponses(sessions);
    }

    @Override
    public List<InterviewAnswerResponseDTO> getInterviewAnswers(UUID sessionId) {
        InterviewSession session = interviewSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Interview session not found"));

        Gallery gallery = getGalleryForCurrentUser();
        if (!session.getGallery().getId().equals(gallery.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION);
        }

        List<InterviewAnswer> answers = interviewAnswerRepository.findBySession(session);
        return galleryMapper.answersToAnswerResponses(answers);
    }
}
