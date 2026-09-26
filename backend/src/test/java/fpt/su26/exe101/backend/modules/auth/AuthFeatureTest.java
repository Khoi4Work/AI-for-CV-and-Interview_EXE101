package fpt.su26.exe101.backend.modules.auth;

import fpt.su26.exe101.backend.modules.auth.controller.AuthController;
import fpt.su26.exe101.backend.modules.auth.dto.request.*;
import fpt.su26.exe101.backend.modules.auth.dto.response.*;
import fpt.su26.exe101.backend.modules.auth.entity.*;
import fpt.su26.exe101.backend.modules.auth.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AuthFeatureTest {

    @Mock
    private AccountService accountService;
    @Mock
    private AuthService authService;
    @Mock
    private RecoveryService recoveryService;
    @Mock
    private InvitationService invitationService;
    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(userDetails.getUsername()).thenReturn("test@example.com");
    }

    @Test
    void testUpdateProfile_HappyPath() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setBio("New Bio");

        Account account = new Account();
        account.setId(UUID.randomUUID());

        when(accountService.getAccountByEmail("test@example.com")).thenReturn(account);

        ResponseEntity<GenericResponse> result = authController.updateProfile(userDetails, request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals("Profile updated successfully", result.getBody().getMessage());
        verify(accountService).getAccountByEmail("test@example.com");
        verify(accountService).updateProfile(eq(account.getId()), eq(request));
    }

    @Test
    void testChangePassword_HappyPath() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setNewPassword("NewSecurePass123!");

        ResponseEntity<GenericResponse> result = authController.changePassword(userDetails, request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals("Password changed successfully", result.getBody().getMessage());
        verify(accountService).changePassword("test@example.com", request);
    }

    @Test
    void testInvitePartner_HappyPath() {
        InvitePartnerRequest request = new InvitePartnerRequest();
        request.setEmail("partner@example.com");
        request.setRole("MANAGER");

        Account account = new Account();
        account.setId(UUID.randomUUID());

        GenericResponse response = GenericResponse.builder()
                .message("Invitation sent successfully")
                .build();

        when(accountService.getAccountByEmail("test@example.com")).thenReturn(account);
        when(invitationService.invitePartner(eq(account.getId()), any(InvitePartnerRequest.class))).thenReturn(response);

        ResponseEntity<GenericResponse> result = authController.invitePartner(userDetails, request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals("Invitation sent successfully", result.getBody().getMessage());
        verify(accountService).getAccountByEmail("test@example.com");
        verify(invitationService).invitePartner(eq(account.getId()), eq(request));
    }

    @Test
    void testUpdateProfile_AccountNotFound_Negative() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        when(accountService.getAccountByEmail("test@example.com")).thenThrow(new RuntimeException("Account not found"));

        assertThrows(RuntimeException.class, () -> {
            authController.updateProfile(userDetails, request);
        });
    }
}
