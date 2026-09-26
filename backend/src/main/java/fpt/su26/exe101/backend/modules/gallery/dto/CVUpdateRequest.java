package fpt.su26.exe101.backend.modules.gallery.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVUpdateRequest {
    private String name;
    private java.util.Map<String, Object> content;
    private Long templateId;
}
