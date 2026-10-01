package fpt.su26.exe101.backend.modules.auth.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IdentityResponseDTO {
    private AccountDetail account;
    private ProfileDetail profile;
    private QuotaDetail quota;

    @Data
    @Builder
    public static class AccountDetail {
        private String email;
        private String role;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    public static class ProfileDetail {
        private String displayName;
        private String companyName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Map<String, String> info;
    }

    @Data
    @Builder
    public static class QuotaDetail {
        private Integer remainingCvCount;
        private Integer remainingInterviewMinutes;
    }
}
