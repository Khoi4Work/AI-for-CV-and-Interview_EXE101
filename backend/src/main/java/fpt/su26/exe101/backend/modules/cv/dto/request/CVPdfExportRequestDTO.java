package fpt.su26.exe101.backend.modules.cv.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVPdfExportRequestDTO {
    private String html;
    private String fileName;
    private String templateId;
}
