package fpt.su26.exe101.backend.modules.gallery.dto;

import lombok.*;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVImportResponseDTO {
    private Map<String, Object> extractedData;
}
