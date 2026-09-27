package fpt.su26.exe101.backend.modules.gallery.dto;

import lombok.*;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVImportResponseDTO {
    private Map<String, Object> extractedData;
    private UUID cvId;
    private String sourceHash;
    private boolean duplicate;
}
