package fpt.su26.exe101.backend.modules.gallery.service;

import fpt.su26.exe101.backend.modules.gallery.dto.request.JDCreateRequestDTO;
import fpt.su26.exe101.backend.modules.gallery.dto.request.JDUpdateRequestDTO;
import fpt.su26.exe101.backend.modules.gallery.dto.response.GalleryAssetsResponseDTO;
import fpt.su26.exe101.backend.modules.gallery.dto.response.InterviewAnswerResponseDTO;
import fpt.su26.exe101.backend.modules.gallery.dto.response.InterviewSessionResponseDTO;
import fpt.su26.exe101.backend.modules.gallery.dto.response.JDResponseDTO;

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
