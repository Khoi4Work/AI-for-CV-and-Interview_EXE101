package fpt.su26.exe101.backend.modules.auth.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.base.service.EmailService;
import fpt.su26.exe101.backend.modules.auth.dto.request.*;
import fpt.su26.exe101.backend.modules.auth.entity.Account;
import fpt.su26.exe101.backend.modules.auth.entity.enums.AccountProvider;
import fpt.su26.exe101.backend.modules.auth.repository.AccountRepository;
import fpt.su26.exe101.backend.modules.auth.service.RecoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecoveryServiceImpl implements RecoveryService {
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public void forgotPassword(ForgotPasswordRequestDTO request) {
        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Email không tồn tại trong hệ thống"));

        if (account.getProvider() == AccountProvider.GOOGLE) {
            throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Tài khoản này được liên kết với Google, vui lòng đăng nhập hoặc đổi mật khẩu bằng Google");
        }

        String resetToken = UUID.randomUUID().toString();
        account.setResetPasswordToken(resetToken);
        accountRepository.save(account);

        emailService.sendResetPasswordEmail(account.getEmail(), resetToken);
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
