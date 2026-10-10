package fpt.su26.exe101.backend.modules.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.modules.auth.dto.request.RegisterRequestDTO;
import fpt.su26.exe101.backend.modules.auth.entity.*;
import fpt.su26.exe101.backend.modules.auth.entity.enums.*;
import fpt.su26.exe101.backend.modules.auth.entity.enums.AccountProvider;
import fpt.su26.exe101.backend.modules.auth.repository.*;
import fpt.su26.exe101.backend.modules.auth.service.impl.AccountServiceImpl;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountRegistrationVerificationTest {
    @Mock AccountRepository accounts;
    @Mock AttendanceRepository attendance;
    @Mock AttendanceInfoRepository info;
    @Mock PartnerRepository partners;
    @Mock PartnerInfoRepository partnerInfo;
    @Mock PasswordEncoder encoder;
    @Mock EmailVerificationService verification;
    @Mock ApplicationEventPublisher events;
    @Mock UsageQuotaService quota;
    @InjectMocks AccountServiceImpl service;

    @Test void registrationCannotCreateAdmin() {
        assertThrows(ApiException.class, () -> service.register(RegisterRequestDTO.builder().role(AccountRole.ADMIN).build()));
        verifyNoInteractions(accounts,attendance,partners,encoder,verification);
    }

    @Test void pendingRegistrationQueuesVerificationWithoutProvisioningOrExposingToken() throws Exception {
        when(accounts.save(any())).thenAnswer(call -> {
            Account a = call.getArgument(0);
            a.setId(UUID.randomUUID());
            return a;
        });
        when(attendance.save(any())).thenAnswer(call -> call.getArgument(0));
        when(encoder.encode("secret")).thenReturn("encoded");
        var result = service.register(RegisterRequestDTO.builder().email(" User@Example.com ")
                .password("secret").confirmPassword("secret").role(AccountRole.ATTENDANCE).build());
        verify(verification).issue(argThat(a -> "user@example.com".equals(a.getEmail())
                && "PENDING_VERIFICATION".equals(a.getStatus())));
        verifyNoInteractions(events, quota);
        assertFalse(new ObjectMapper().writeValueAsString(result).contains("verificationToken"));
    }

    @Test void googleDoesNotPromoteExistingPendingLocalAccount() {
        Account account = Account.builder().email("user@example.com").provider(AccountProvider.LOCAL)
                .status("PENDING_VERIFICATION").build();
        when(accounts.findByEmail("user@example.com")).thenReturn(Optional.of(account));
        assertThrows(ApiException.class, () -> service.createOAuthAccount("USER@example.com", "Name"));
        assertEquals("PENDING_VERIFICATION", account.getStatus());
        verifyNoInteractions(events, verification);
    }
}
