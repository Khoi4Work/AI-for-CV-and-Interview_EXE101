package fpt.su26.exe101.backend.modules.auth.controller;

import fpt.su26.exe101.backend.modules.auth.dto.request.*;
import fpt.su26.exe101.backend.modules.auth.dto.response.*;
import fpt.su26.exe101.backend.modules.auth.entity.Account;
import fpt.su26.exe101.backend.modules.auth.service.*;
import fpt.su26.exe101.backend.base.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRequest;

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
    public ResponseEntity<ApiResponse<RegisterResponseDTO>> register(@RequestBody RegisterRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(accountService.register(request), "Account registered"));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@RequestParam String token) {
        accountService.verifyEmail(token);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(java.net.URI.create("http://localhost:5173/login?verified=true"))
                .build();
    }

    @PostMapping("/tokens")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(request)));
    }

    @PostMapping("/oauth/{provider}")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> socialLogin(@PathVariable String provider, @RequestBody OAuthRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.success(authService.socialLogin(provider, request)));
    }

    @PutMapping("/tokens/refresh")
    public ResponseEntity<ApiResponse<TokenRefreshResponseDTO>> refresh(@RequestBody RefreshTokenRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.success(authService.refresh(request)));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<GenericResponseDTO>> forgotPassword(@RequestBody ForgotPasswordRequestDTO request) {
        recoveryService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success(
                GenericResponseDTO.builder().message("If the email exists, a reset link has been sent.").build()));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<GenericResponseDTO>> resetPassword(@RequestBody ResetPasswordRequestDTO request) {
        recoveryService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(
                GenericResponseDTO.builder().message("Password updated successfully. Please login.").build()));
    }

    @PatchMapping("/profile/info")
    public ResponseEntity<ApiResponse<GenericResponseDTO>> updateProfile(@AuthenticationPrincipal UserDetails userDetails, @RequestBody UpdateProfileRequestDTO request) {
        Account account = accountService.getAccountByEmail(userDetails.getUsername());
        accountService.updateProfile(account.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(
                GenericResponseDTO.builder().message("Profile updated successfully").build()));
    }

    @PatchMapping("/password")
    public ResponseEntity<ApiResponse<GenericResponseDTO>> changePassword(@AuthenticationPrincipal UserDetails userDetails, @RequestBody ChangePasswordRequestDTO request) {
        accountService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(
                GenericResponseDTO.builder().message("Password changed successfully").build()));
    }

    @DeleteMapping("/tokens")
    public ResponseEntity<ApiResponse<GenericResponseDTO>> logout(@RequestBody RefreshTokenRequestDTO request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(
                GenericResponseDTO.builder().message("Logged out successfully").build()));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        java.util.Map<String, Object> profile = accountService.getFullProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile retrieved successfully"));
    }

    @PostMapping("/invite")
    public ResponseEntity<ApiResponse<GenericResponseDTO>> invitePartner(@AuthenticationPrincipal UserDetails userDetails, @RequestBody InvitePartnerRequestDTO request) {
        Account account = accountService.getAccountByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(invitationService.invitePartner(account.getId(), request)));
    }
}
