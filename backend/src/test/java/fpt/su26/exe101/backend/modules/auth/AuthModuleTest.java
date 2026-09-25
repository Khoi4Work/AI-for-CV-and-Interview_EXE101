package fpt.su26.exe101.backend.modules.auth;

import fpt.su26.exe101.backend.modules.auth.dto.request.*;
import fpt.su26.exe101.backend.modules.auth.dto.response.*;
import fpt.su26.exe101.backend.modules.auth.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AuthModuleTest {

    @Mock
    private AccountService accountService;
    @Mock
    private AuthService authService;
    @Mock
    private RecoveryService recoveryService;
    @Mock
    private InvitationService invitationService;

    @InjectMocks
    private fpt.su26.exe101.backend.modules.auth.controller.AuthController authController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegistrationFlow_HappyPath() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");
        request.setRole(fpt.su26.exe101.backend.modules.auth.entity.enums.AccountRole.ATTENDANCE);
        request.setDisplayName("Test User");

        RegisterResponse response = new RegisterResponse();
        response.setMessage("Account created. Please verify your email.");
        response.setId(UUID.randomUUID().toString());
        response.setVerificationToken("test-token");

        when(accountService.register(any(RegisterRequest.class))).thenReturn(response);

        ResponseEntity<RegisterResponse> result = authController.register(request);

        assertEquals(HttpStatus.CREATED, result.getStatusCode());
        assertEquals("test-token", result.getBody().getVerificationToken());
        verify(accountService).register(request);
    }

    @Test
    void testVerifyEmail_HappyPath() {
        String token = "test-token";

        doNothing().when(accountService).verifyEmail(anyString());

        ResponseEntity<fpt.su26.exe101.backend.modules.auth.dto.response.GenericResponse> result = authController.verifyEmail(token);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals("Email verified successfully. You can now login.", result.getBody().getMessage());
        verify(accountService).verifyEmail(token);
    }

    @Test
    void testLogin_HappyPath() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        AuthResponse response = new AuthResponse();
        response.setAccessToken("access-token");
        response.setRefreshToken("refresh-token");
        response.setRole(fpt.su26.exe101.backend.modules.auth.entity.enums.AccountRole.ATTENDANCE.name());

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        ResponseEntity<AuthResponse> result = authController.login(request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals("access-token", result.getBody().getAccessToken());
        verify(authService).login(request);
    }

    @Test
    void testRefreshToken_HappyPath() {
        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("refresh-token");

        TokenRefreshResponse response = new TokenRefreshResponse();
        response.setAccessToken("new-access-token");

        when(authService.refresh(any(RefreshTokenRequest.class))).thenReturn(response);

        ResponseEntity<TokenRefreshResponse> result = authController.refresh(request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals("new-access-token", result.getBody().getAccessToken());
        verify(authService).refresh(request);
    }

    @Test
    void testForgotPassword_HappyPath() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("test@example.com");

        doNothing().when(recoveryService).forgotPassword(any(ForgotPasswordRequest.class));

        ResponseEntity<fpt.su26.exe101.backend.modules.auth.dto.response.GenericResponse> result = authController.forgotPassword(request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals("If the email exists, a reset link has been sent.", result.getBody().getMessage());
        verify(recoveryService).forgotPassword(request);
    }

    @Test
    void testResetPassword_HappyPath() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("reset-token");
        request.setNewPassword("newPassword123");

        doNothing().when(recoveryService).resetPassword(any(ResetPasswordRequest.class));

        ResponseEntity<fpt.su26.exe101.backend.modules.auth.dto.response.GenericResponse> result = authController.resetPassword(request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals("Password updated successfully. Please login.", result.getBody().getMessage());
        verify(recoveryService).resetPassword(request);
    }

    @Test
    void testSocialLogin_HappyPath() {
        OAuthRequest request = new OAuthRequest();
        request.setToken("oauth-token");

        AuthResponse response = new AuthResponse();
        response.setAccessToken("access-token");
        response.setRefreshToken("refresh-token");
        response.setRole("ATTENDANCE");

        when(authService.socialLogin(eq("google"), any(OAuthRequest.class))).thenReturn(response);

        ResponseEntity<AuthResponse> result = authController.socialLogin("google", request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals("access-token", result.getBody().getAccessToken());
        verify(authService).socialLogin("google", request);
    }

    @Test
    void testLogout_HappyPath() {
        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("refresh-token");

        doNothing().when(authService).logout(anyString());

        ResponseEntity<fpt.su26.exe101.backend.modules.auth.dto.response.GenericResponse> result = authController.logout(request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals("Logged out successfully", result.getBody().getMessage());
        verify(authService).logout("refresh-token");
    }

    @Test
    void testInvitePartner_HappyPath() {
        InvitePartnerRequest request = new InvitePartnerRequest();
        request.setEmail("partner@example.com");
        request.setRole("MANAGER");

        fpt.su26.exe101.backend.modules.auth.dto.response.GenericResponse response =
            fpt.su26.exe101.backend.modules.auth.dto.response.GenericResponse.builder()
                .message("Invitation sent successfully")
                .build();

        when(invitationService.invitePartner(any(UUID.class), any(InvitePartnerRequest.class))).thenReturn(response);

        ResponseEntity<fpt.su26.exe101.backend.modules.auth.dto.response.GenericResponse> result = authController.invitePartner(null, request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals("Invitation sent successfully", result.getBody().getMessage());
        verify(invitationService).invitePartner(any(UUID.class), eq(request));
    }
}
