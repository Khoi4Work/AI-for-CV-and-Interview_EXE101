package fpt.su26.exe101.backend.modules.auth.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterResponse {
    private String message;
    private String id;
    private String verificationToken;
}
