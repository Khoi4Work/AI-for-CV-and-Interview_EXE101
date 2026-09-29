package fpt.su26.exe101.backend.modules.gallery.service;

import fpt.su26.exe101.backend.modules.gallery.dto.request.JDCreateRequestDTO;
import fpt.su26.exe101.backend.modules.gallery.dto.request.JDUpdateRequestDTO;
import fpt.su26.exe101.backend.modules.gallery.dto.response.JDResponseDTO;
import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescription;

import java.util.UUID;

public interface GalleryService {
    java.util.List<JDResponseDTO> getJobDescriptionsForCurrentGallery();
    JDResponseDTO createJobDescription(JDCreateRequestDTO request);
    JDResponseDTO updateJobDescription(UUID id, JDUpdateRequestDTO request);
    void deleteJobDescription(UUID id);
    Gallery getCurrentGallery();
    JobDescription findJobDescription(UUID id, Gallery gallery);
    JobDescription findOrCreateJobDescription(String jdText, Gallery gallery);
}
