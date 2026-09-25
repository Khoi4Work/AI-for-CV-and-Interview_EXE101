package fpt.su26.exe101.backend.modules.auth.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenericResponse {
    private String message;
    private String id;
}
