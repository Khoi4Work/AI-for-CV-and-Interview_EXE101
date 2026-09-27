package fpt.su26.exe101.backend.modules.gallery.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GalleryAssetsResponseDTO {
    private List<CVResponseDTO> cvs;
    private List<JDResponseDTO> jds;
}
