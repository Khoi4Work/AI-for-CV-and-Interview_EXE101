package fpt.su26.exe101.backend.modules.interview.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;
import fpt.su26.exe101.backend.modules.gallery.service.GalleryService;
import fpt.su26.exe101.backend.modules.interview.entity.InterviewSession;
import fpt.su26.exe101.backend.modules.interview.mapper.InterviewMapper;
import fpt.su26.exe101.backend.modules.interview.repository.InterviewAnswerRepository;
import fpt.su26.exe101.backend.modules.interview.repository.InterviewSessionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InterviewServiceImplTest {
    @Mock
    private InterviewSessionRepository sessionRepository;
    @Mock
    private InterviewAnswerRepository answerRepository;
    @Mock
    private InterviewMapper interviewMapper;
    @Mock
    private GalleryService galleryService;

    @InjectMocks
    private InterviewServiceImpl interviewService;

    @Test
    void getInterviewHistoryQueriesSessionsForCurrentGallery() {
        Gallery gallery = gallery(UUID.randomUUID());
        when(galleryService.getCurrentGallery()).thenReturn(gallery);

        interviewService.getInterviewHistory();

        verify(sessionRepository).findByGallery(gallery);
    }

    @Test
    void getInterviewAnswersRejectsSessionOwnedByAnotherGallery() {
        Gallery currentGallery = gallery(UUID.randomUUID());
        Gallery otherGallery = gallery(UUID.randomUUID());
        InterviewSession session = InterviewSession.builder().gallery(otherGallery).build();
        UUID sessionId = UUID.randomUUID();
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(galleryService.getCurrentGallery()).thenReturn(currentGallery);

        ApiException exception = assertThrows(ApiException.class,
                () -> interviewService.getInterviewAnswers(sessionId));

        assertEquals(ErrorCode.FORBIDDEN_ACTION, exception.getErrorCode());
    }

    private Gallery gallery(UUID id) {
        Gallery gallery = Gallery.builder().accountId(UUID.randomUUID()).build();
        gallery.setId(id);
        return gallery;
    }
}
