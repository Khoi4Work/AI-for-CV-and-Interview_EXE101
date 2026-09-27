package fpt.su26.exe101.backend.modules.gallery.service;

import fpt.su26.exe101.backend.modules.gallery.dto.*;

import java.util.List;
import java.util.UUID;

public interface GalleryService {
    GalleryAssetsResponseDTO getGalleryAssets();
    JDResponseDTO createJobDescription(JDCreateRequestDTO request);
    JDResponseDTO updateJobDescription(UUID id, JDUpdateRequestDTO request);
    void deleteJobDescription(UUID id);
    void deleteCV(UUID cvId);
    List<InterviewSessionResponseDTO> getInterviewHistory();
    List<InterviewAnswerResponseDTO> getInterviewAnswers(UUID sessionId);
}
