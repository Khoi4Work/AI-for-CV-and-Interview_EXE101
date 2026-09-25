package fpt.su26.exe101.backend.modules.auth.dto.request;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordRequest {
    private String email;
}
