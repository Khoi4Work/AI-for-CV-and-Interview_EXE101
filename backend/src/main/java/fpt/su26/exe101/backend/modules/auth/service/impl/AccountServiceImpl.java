package fpt.su26.exe101.backend.modules.auth.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import fpt.su26.exe101.backend.base.service.EmailService;
import fpt.su26.exe101.backend.modules.auth.dto.request.*;
import fpt.su26.exe101.backend.modules.auth.dto.response.*;
import fpt.su26.exe101.backend.modules.auth.entity.*;
import fpt.su26.exe101.backend.modules.auth.entity.enums.AccountProvider;
import fpt.su26.exe101.backend.modules.auth.entity.enums.AccountRole;
import fpt.su26.exe101.backend.modules.auth.event.AccountCreatedEvent;
import org.springframework.context.ApplicationEventPublisher;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import fpt.su26.exe101.backend.modules.auth.repository.*;
import fpt.su26.exe101.backend.modules.auth.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountServiceImpl implements AccountService {
    private final AccountRepository accountRepository;
    private final AttendanceRepository attendanceRepository;
    private final AttendanceInfoRepository attendanceInfoRepository;
    private final PartnerRepository partnerRepository;
    private final PartnerInfoRepository partnerInfoRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final ApplicationEventPublisher eventPublisher;
    private final UsageQuotaService quotaService;

    @Override
    @Transactional
    public RegisterResponseDTO register(RegisterRequestDTO request) {
        if (request.getPassword() == null || request.getConfirmPassword() == null
                || !Objects.equals(request.getPassword(), request.getConfirmPassword())) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Mật khẩu xác nhận không khớp");
        }

        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new ApiException(ErrorCode.DUPLICATE_RESOURCE, "Email already exists");
        }

        String verificationToken = UUID.randomUUID().toString();

        Account account = Account.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .provider(AccountProvider.LOCAL)
                .role(request.getRole() != null ? request.getRole() : AccountRole.ATTENDANCE)
                .status("PENDING_VERIFICATION")
                .verificationToken(verificationToken)
                .build();

        account = accountRepository.save(account);
        eventPublisher.publishEvent(new AccountCreatedEvent(account.getId()));

        if (account.getRole() == AccountRole.ATTENDANCE) {
            // Get default name from email if displayName is not provided
            String defaultName = request.getEmail().split("@")[0];
            Attendance attendance = Attendance.builder()
                    .account(account)
                    .displayName(request.getDisplayName() != null ? request.getDisplayName() : defaultName)
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
        log.info("[AUTH] Account registered | accountId={} | role={} | provider=local",
                account.getId(), account.getRole());

        return RegisterResponseDTO.builder()
                .message("Account created. Please verify your email.")
                .id(account.getId().toString())
                .verificationToken(verificationToken)
                .build();
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        int updatedRows = accountRepository.verifyEmailToken(token, "ACTIVE");
        if (updatedRows == 0) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Invalid or expired token");
        }
        log.info("[AUTH] Email verified | provider=local");
    }

    @Override
    @Transactional
    public Account createOAuthAccount(String email, String name) {
        Optional<Account> existingAccount = accountRepository.findByEmail(email);
        if (existingAccount.isPresent()) {
            return existingAccount.get();
        }

        Account account = Account.builder()
                .email(email)
                .provider(AccountProvider.GOOGLE)
                .role(AccountRole.ATTENDANCE)
                .status("ACTIVE")
                .build();

        account = accountRepository.save(account);
        eventPublisher.publishEvent(new AccountCreatedEvent(account.getId()));

        // ALWAYS use email prefix as display name for OAuth users
        String finalDisplayName = email.split("@")[0];

        Attendance attendance = Attendance.builder()
                .account(account)
                .displayName(finalDisplayName)
                .build();
        attendance = attendanceRepository.save(attendance);

        AttendanceInfo info = AttendanceInfo.builder()
                .attendance(attendance)
                .build();
        attendanceInfoRepository.save(info);

        log.info("[AUTH] OAuth account registered | accountId={} | provider=google", account.getId());

        return account;
    }

    @Override
    @Transactional
    public void updateProfile(UUID accountId, UpdateProfileRequestDTO request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Account not found"));

        if (account.getRole() == AccountRole.ATTENDANCE) {
            Attendance attendance = attendanceRepository.findByAccount(account);
            if (attendance == null) {
                throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Attendance profile not found");
            }
            AttendanceInfo info = attendanceInfoRepository.findByAttendance(attendance);
            if (info == null) {
                throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Attendance info not found");
            }
            if (request.getBio() != null) info.setBio(request.getBio());
            if (request.getCareerGoal() != null) info.setCareerGoal(request.getCareerGoal());
            if (request.getExperienceLevel() != null) info.setExperienceLevel(request.getExperienceLevel());
            if (request.getPhone() != null) info.setPhone(request.getPhone());
            if (request.getLocation() != null) info.setLocation(request.getLocation());
            if (request.getProfession() != null) info.setProfession(request.getProfession());
            if (request.getLinkedin() != null) info.setLinkedin(request.getLinkedin());
            if (request.getPortfolio() != null) info.setPortfolio(request.getPortfolio());
            if (request.getGithub() != null) info.setGithub(request.getGithub());
            if (request.getFullName() != null) attendance.setDisplayName(request.getFullName());
            attendanceRepository.save(attendance);
            attendanceInfoRepository.save(info);
        } else {
            Partner partner = partnerRepository.findByAccount(account);
            if (partner == null) {
                throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Partner profile not found");
            }
            PartnerInfo info = partnerInfoRepository.findByPartner(partner);
            if (info == null) {
                throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Partner info not found");
            }
            if (request.getIndustry() != null) info.setIndustry(request.getIndustry());
            if (request.getCompanySize() != null) info.setCompanySize(request.getCompanySize());
            if (request.getPhone() != null) info.setPhone(request.getPhone());
            if (request.getLocation() != null) info.setLocation(request.getLocation());
            if (request.getProfession() != null) info.setProfession(request.getProfession());
            if (request.getLinkedin() != null) info.setLinkedin(request.getLinkedin());
            if (request.getPortfolio() != null) info.setPortfolio(request.getPortfolio());
            if (request.getGithub() != null) info.setGithub(request.getGithub());
            if (request.getFullName() != null) partner.setCompanyName(request.getFullName());
            partnerRepository.save(partner);
            partnerInfoRepository.save(info);
        }
    }

    @Override
    public Account getAccountByEmail(String email) {
        return accountRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Account not found"));
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequestDTO request) {
        if (request == null || request.getOldPassword() == null || request.getNewPassword() == null
                || request.getNewPassword().isBlank()) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Current and new passwords are required");
        }
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Account not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), account.getPasswordHash())) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Incorrect current password");
        }

        account.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
    }

    @Override
    public Map<String, Object> getFullProfile(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Account not found"));

        Map<String, Object> profile = new HashMap<>();
        profile.put("email", account.getEmail());
        profile.put("provider", account.getProvider());
        profile.put("role", account.getRole());
        profile.put("status", account.getStatus());

        if (account.getRole() == AccountRole.ATTENDANCE) {
            Attendance attendance = attendanceRepository.findByAccount(account);
            AttendanceInfo info = (attendance != null) ? attendanceInfoRepository.findByAttendance(attendance) : null;
            profile.put("fullName", attendance != null ? attendance.getDisplayName() : account.getEmail());
            if (info != null) {
                profile.put("bio", info.getBio());
                profile.put("careerGoal", info.getCareerGoal());
                profile.put("experienceLevel", info.getExperienceLevel());
                profile.put("phone", info.getPhone());
                profile.put("location", info.getLocation());
                profile.put("profession", info.getProfession());
                profile.put("linkedin", info.getLinkedin());
                profile.put("portfolio", info.getPortfolio());
                profile.put("github", info.getGithub());
            }
        } else if (account.getRole() == AccountRole.PARTNER) {
            Partner partner = partnerRepository.findByAccount(account);
            PartnerInfo info = (partner != null) ? partnerInfoRepository.findByPartner(partner) : null;
            profile.put("fullName", partner != null ? partner.getCompanyName() : account.getEmail());
            if (info != null) {
                profile.put("industry", info.getIndustry());
                profile.put("companySize", info.getCompanySize());
                profile.put("phone", info.getPhone());
                profile.put("location", info.getLocation());
                profile.put("profession", info.getProfession());
                profile.put("linkedin", info.getLinkedin());
                profile.put("portfolio", info.getPortfolio());
                profile.put("github", info.getGithub());
            }
        } else {
            profile.put("fullName", account.getEmail());
        }

        String planName = quotaService.getCvPlan(account.getId()).name();
        profile.put("membershipType", planName.charAt(0) + planName.substring(1).toLowerCase());
        String interviewPlanName = quotaService.getInterviewPlan(account.getId()).name();
        profile.put("interviewMembershipType", interviewPlanName.charAt(0) + interviewPlanName.substring(1).toLowerCase());
        profile.put("memberSince", account.getCreatedAt() == null ? "" : String.valueOf(account.getCreatedAt().getYear()));

        return profile;
    }

}
