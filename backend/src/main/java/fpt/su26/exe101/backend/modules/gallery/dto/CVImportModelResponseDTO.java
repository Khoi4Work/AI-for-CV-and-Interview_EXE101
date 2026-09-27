package fpt.su26.exe101.backend.modules.gallery.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVImportModelResponseDTO {
    private Boolean isCV;
    private CVContent extractedData;
}
