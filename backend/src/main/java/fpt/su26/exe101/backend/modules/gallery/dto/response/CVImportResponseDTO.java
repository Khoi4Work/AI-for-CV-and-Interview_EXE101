package fpt.su26.exe101.backend.modules.gallery.dto.response;

import fpt.su26.exe101.backend.modules.gallery.dto.CVContent;
import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVImportResponseDTO {
    private CVContent extractedData;
    private UUID cvId;
    private String sourceHash;
    private boolean duplicate;
}
