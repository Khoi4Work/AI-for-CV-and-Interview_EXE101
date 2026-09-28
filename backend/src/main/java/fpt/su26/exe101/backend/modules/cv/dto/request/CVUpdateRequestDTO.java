package fpt.su26.exe101.backend.modules.cv.dto.request;

import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVUpdateRequestDTO {
    private String name;
    private CVContent content;
    private Long templateId;
}
