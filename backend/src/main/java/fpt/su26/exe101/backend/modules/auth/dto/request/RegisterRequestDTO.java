package fpt.su26.exe101.backend.modules.auth.dto.request;

import fpt.su26.exe101.backend.modules.auth.entity.enums.AccountRole;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequestDTO {
    private String email;
    private String password;
    private AccountRole role;
    private String displayName;
}
