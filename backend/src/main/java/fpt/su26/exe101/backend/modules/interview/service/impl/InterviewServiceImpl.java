package fpt.su26.exe101.backend.modules.interview.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;
import fpt.su26.exe101.backend.modules.gallery.service.GalleryService;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewAnswerResponseDTO;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewSessionResponseDTO;
import fpt.su26.exe101.backend.modules.interview.entity.InterviewSession;
import fpt.su26.exe101.backend.modules.interview.mapper.InterviewMapper;
import fpt.su26.exe101.backend.modules.interview.repository.InterviewAnswerRepository;
import fpt.su26.exe101.backend.modules.interview.repository.InterviewSessionRepository;
import fpt.su26.exe101.backend.modules.interview.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {
    private final InterviewSessionRepository sessionRepository;
    private final InterviewAnswerRepository answerRepository;
    private final InterviewMapper interviewMapper;
    private final GalleryService galleryService;

    @Override
    public List<InterviewSessionResponseDTO> getInterviewHistory() {
        Gallery gallery = galleryService.getCurrentGallery();
        return interviewMapper.sessionsToSessionResponses(sessionRepository.findByGallery(gallery));
    }

    @Override
    public List<InterviewAnswerResponseDTO> getInterviewAnswers(UUID sessionId) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Interview session not found"));
        Gallery gallery = galleryService.getCurrentGallery();
        if (!session.getGallery().getId().equals(gallery.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION);
        }
        return interviewMapper.answersToAnswerResponses(answerRepository.findBySession(session));
    }
}
