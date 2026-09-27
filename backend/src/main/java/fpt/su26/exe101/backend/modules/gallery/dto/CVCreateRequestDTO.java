package fpt.su26.exe101.backend.modules.gallery.dto;

import lombok.*;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVCreateRequestDTO {
    private String name;
    private Map<String, Object> content;
    private Long templateId;
}
