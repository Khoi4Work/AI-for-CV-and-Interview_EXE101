package fpt.su26.exe101.backend.modules.auth.service;

import fpt.su26.exe101.backend.base.service.EmailService;
import fpt.su26.exe101.backend.modules.auth.dto.request.*;
import fpt.su26.exe101.backend.modules.auth.entity.Account;
import fpt.su26.exe101.backend.modules.auth.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecoveryService {
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public void forgotPassword(ForgotPasswordRequestDTO request) {
        accountRepository.findByEmail(request.getEmail()).ifPresent(account -> {
            String resetToken = UUID.randomUUID().toString();
            account.setResetPasswordToken(resetToken);
            accountRepository.save(account);

            emailService.sendResetPasswordEmail(account.getEmail(), resetToken);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequestDTO request) {
        Account account = accountRepository.findByResetPasswordToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        account.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        account.setResetPasswordToken(null); // Clear token after use
        accountRepository.save(account);
    }
}
