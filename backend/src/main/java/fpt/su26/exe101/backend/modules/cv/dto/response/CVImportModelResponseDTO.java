package fpt.su26.exe101.backend.modules.cv.dto.response;

import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVImportModelResponseDTO {
    private Boolean isCV;
    private CVContent extractedData;
}
