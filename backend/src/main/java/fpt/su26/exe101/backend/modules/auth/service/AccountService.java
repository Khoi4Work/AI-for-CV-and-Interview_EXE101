package fpt.su26.exe101.backend.modules.auth.service;

import fpt.su26.exe101.backend.base.service.EmailService;
import fpt.su26.exe101.backend.modules.auth.dto.request.*;
import fpt.su26.exe101.backend.modules.auth.dto.response.*;
import fpt.su26.exe101.backend.modules.auth.entity.*;
import fpt.su26.exe101.backend.modules.auth.entity.enums.AccountRole;
import fpt.su26.exe101.backend.modules.auth.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final AccountRepository accountRepository;
    private final AttendanceRepository attendanceRepository;
    private final AttendanceInfoRepository attendanceInfoRepository;
    private final PartnerRepository partnerRepository;
    private final PartnerInfoRepository partnerInfoRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        String verificationToken = UUID.randomUUID().toString();

        Account account = Account.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status("PENDING_VERIFICATION")
                .verificationToken(verificationToken)
                .build();

        account = accountRepository.save(account);

        if (account.getRole() == AccountRole.ATTENDANCE) {
            Attendance attendance = Attendance.builder()
                    .account(account)
                    .displayName(request.getDisplayName())
                    .build();
            attendance = attendanceRepository.save(attendance);

            AttendanceInfo info = AttendanceInfo.builder()
                    .attendance(attendance)
                    .build();
            attendanceInfoRepository.save(info);
        } else {
            Partner partner = Partner.builder()
                    .account(account)
                    .companyName(request.getDisplayName())
                    .build();
            partner = partnerRepository.save(partner);

            PartnerInfo info = PartnerInfo.builder()
                    .partner(partner)
                    .build();
            partnerInfoRepository.save(info);
        }

        emailService.sendVerificationEmail(account.getEmail(), verificationToken);

        return RegisterResponse.builder()
                .message("Account created. Please verify your email.")
                .id(account.getId().toString())
                .verificationToken(verificationToken)
                .build();
    }

    @Transactional
    public void verifyEmail(String token) {
        int updatedRows = accountRepository.verifyEmailToken(token, "ACTIVE");
        if (updatedRows == 0) {
            throw new RuntimeException("Invalid or expired token");
        }
    }

    @Transactional
    public Account createOAuthAccount(String email, String name) {
        Optional<Account> existingAccount = accountRepository.findByEmail(email);
        if (existingAccount.isPresent()) {
            return existingAccount.get();
        }

        Account account = Account.builder()
                .email(email)
                .passwordHash("OAUTH2_" + UUID.randomUUID())
                .role(AccountRole.ATTENDANCE)
                .status("ACTIVE")
                .build();

        account = accountRepository.save(account);

        Attendance attendance = Attendance.builder()
                .account(account)
                .displayName(name)
                .build();
        attendance = attendanceRepository.save(attendance);

        AttendanceInfo info = AttendanceInfo.builder()
                .attendance(attendance)
                .build();
        attendanceInfoRepository.save(info);

        return account;
    }

    @Transactional
    public void updateProfile(UUID accountId, UpdateProfileRequest request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (account.getRole() == AccountRole.ATTENDANCE) {
            Attendance attendance = attendanceRepository.findByAccount(account);
            AttendanceInfo info = attendanceInfoRepository.findByAttendance(attendance);
            if (request.getBio() != null) info.setBio(request.getBio());
            if (request.getCareerGoal() != null) info.setCareerGoal(request.getCareerGoal());
            if (request.getExperienceLevel() != null) info.setExperienceLevel(request.getExperienceLevel());
            attendanceInfoRepository.save(info);
        } else {
            Partner partner = partnerRepository.findByAccount(account);
            PartnerInfo info = partnerInfoRepository.findByPartner(partner);
            if (request.getIndustry() != null) info.setIndustry(request.getIndustry());
            if (request.getCompanySize() != null) info.setCompanySize(request.getCompanySize());
            partnerInfoRepository.save(info);
        }
    }

    public Account getAccountByEmail(String email) {
        return accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        account.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
    }
}
