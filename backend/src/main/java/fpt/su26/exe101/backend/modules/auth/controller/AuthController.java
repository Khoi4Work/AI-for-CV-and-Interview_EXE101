package fpt.su26.exe101.backend.modules.auth.controller;

import fpt.su26.exe101.backend.modules.auth.dto.request.*;
import fpt.su26.exe101.backend.modules.auth.dto.response.*;
import fpt.su26.exe101.backend.modules.auth.entity.Account;
import fpt.su26.exe101.backend.modules.auth.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AccountService accountService;
    private final AuthService authService;
    private final RecoveryService recoveryService;
    private final InvitationService invitationService;

    @PostMapping("/accounts")
    public ResponseEntity<RegisterResponseDTO> register(@RequestBody RegisterRequestDTO request) {
        return new ResponseEntity<>(accountService.register(request), HttpStatus.CREATED);
    }

    @GetMapping("/verify-email")
    public ResponseEntity<GenericResponseDTO> verifyEmail(@RequestParam String token) {
        accountService.verifyEmail(token);
        return ResponseEntity.ok(GenericResponseDTO.builder().message("Email verified successfully. You can now login.").build());
    }

    @PostMapping("/tokens")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/oauth/{provider}")
    public ResponseEntity<AuthResponseDTO> socialLogin(@PathVariable String provider, @RequestBody OAuthRequestDTO request) {
        return ResponseEntity.ok(authService.socialLogin(provider, request));
    }

    @PutMapping("/tokens/refresh")
    public ResponseEntity<TokenRefreshResponseDTO> refresh(@RequestBody RefreshTokenRequestDTO request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<GenericResponseDTO> forgotPassword(@RequestBody ForgotPasswordRequestDTO request) {
        recoveryService.forgotPassword(request);
        return ResponseEntity.ok(GenericResponseDTO.builder().message("If the email exists, a reset link has been sent.").build());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<GenericResponseDTO> resetPassword(@RequestBody ResetPasswordRequestDTO request) {
        recoveryService.resetPassword(request);
        return ResponseEntity.ok(GenericResponseDTO.builder().message("Password updated successfully. Please login.").build());
    }

    @PatchMapping("/profile/info")
    public ResponseEntity<GenericResponseDTO> updateProfile(@AuthenticationPrincipal UserDetails userDetails, @RequestBody UpdateProfileRequestDTO request) {
        Account account = accountService.getAccountByEmail(userDetails.getUsername());
        accountService.updateProfile(account.getId(), request);
        return ResponseEntity.ok(GenericResponseDTO.builder().message("Profile updated successfully").build());
    }

    @PatchMapping("/password")
    public ResponseEntity<GenericResponseDTO> changePassword(@AuthenticationPrincipal UserDetails userDetails, @RequestBody ChangePasswordRequestDTO request) {
        accountService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(GenericResponseDTO.builder().message("Password changed successfully").build());
    }

    @DeleteMapping("/tokens")
    public ResponseEntity<GenericResponseDTO> logout(@RequestBody RefreshTokenRequestDTO request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(GenericResponseDTO.builder().message("Logged out successfully").build());
    }

    @PostMapping("/invite")
    public ResponseEntity<GenericResponseDTO> invitePartner(@AuthenticationPrincipal UserDetails userDetails, @RequestBody InvitePartnerRequestDTO request) {
        Account account = accountService.getAccountByEmail(userDetails.getUsername());
        return ResponseEntity.ok(invitationService.invitePartner(account.getId(), request));
    }
}
