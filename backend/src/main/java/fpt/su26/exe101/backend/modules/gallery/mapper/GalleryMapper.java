package fpt.su26.exe101.backend.modules.gallery.mapper;

import fpt.su26.exe101.backend.modules.gallery.dto.response.JDResponseDTO;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescription;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface GalleryMapper {
    JDResponseDTO jdToJDResponse(JobDescription jd);
    List<JDResponseDTO> jdsToJDResponses(List<JobDescription> jds);
}
