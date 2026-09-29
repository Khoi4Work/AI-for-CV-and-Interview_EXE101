package fpt.su26.exe101.backend.modules.quota.controller;

import fpt.su26.exe101.backend.base.response.ApiResponse;
import fpt.su26.exe101.backend.modules.auth.repository.AccountRepository;
import fpt.su26.exe101.backend.modules.payment.dto.response.QuotaResponseDTO;
import fpt.su26.exe101.backend.modules.quota.entity.UserUsageQuota;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/quota")
@RequiredArgsConstructor
public class QuotaController {

    private final UsageQuotaService usageQuotaService;
    private final AccountRepository accountRepository;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<QuotaResponseDTO>> getMyQuota() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        return accountRepository.findByEmail(email)
                .map(account -> {
                    UserUsageQuota quota = usageQuotaService.getQuota(account.getId())
                            .orElseThrow(() -> new RuntimeException("Quota not found for user"));

                    QuotaResponseDTO response = QuotaResponseDTO.builder()
                            .remainingCvCount(quota.getRemainingCvCnt())
                            .remainingInterviewMinutes(quota.getRemainingIntMin())
                            .remainingAiCvCnt(quota.getRemainingCvAiCnt())
                            .plan(quota.getPlan())
                            .build();

                    return ResponseEntity.ok(ApiResponse.success(response));
                })
                .orElse(ResponseEntity.status(404)
                        .body(ApiResponse.error(404, "Account not found", null)));
    }
}
