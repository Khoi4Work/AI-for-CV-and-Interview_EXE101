package fpt.su26.exe101.backend.modules.gallery.mapper;

import fpt.su26.exe101.backend.modules.gallery.dto.CVResponseDTO;
import fpt.su26.exe101.backend.modules.gallery.entity.CV;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface GalleryMapper {
    CVResponseDTO cvToCVResponse(CV cv);
}
