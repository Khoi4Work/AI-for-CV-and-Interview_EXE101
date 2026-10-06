package fpt.su26.exe101.backend.modules.auth.controller;

import fpt.su26.exe101.backend.base.exception.*;
import fpt.su26.exe101.backend.modules.auth.exception.VerificationRateLimitException;
import fpt.su26.exe101.backend.modules.auth.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.DisabledException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class EmailVerificationControllerTest {
    private final AccountService accounts = mock(AccountService.class);
    private final AuthService auth = mock(AuthService.class);
    private final EmailVerificationService verification = mock(EmailVerificationService.class);
    private MockMvc mvc;

    @BeforeEach void setup() {
        AuthController controller = new AuthController(accounts, auth, mock(RecoveryService.class),
                mock(InvitationService.class), verification);
        ReflectionTestUtils.setField(controller, "frontendUrl", "http://localhost:5173");
        mvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    @Test void resendReturnsGenericResponseWithoutToken() throws Exception {
        mvc.perform(post("/api/auth/resend-verification").contentType("application/json")
                .content("{\"email\":\"guest@example.com\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.result.message").exists())
                .andExpect(jsonPath("$.result.verificationToken").doesNotExist());
        verify(verification).resend(eq("guest@example.com"), anyString());
    }

    @Test void throttlingIncludesActualRetryDelay() throws Exception {
        doThrow(new VerificationRateLimitException(3600)).when(verification).resend(anyString(), anyString());
        mvc.perform(post("/api/auth/resend-verification").contentType("application/json")
                .content("{\"email\":\"guest@example.com\"}"))
                .andExpect(status().isTooManyRequests()).andExpect(header().string("Retry-After", "3600"));
    }

    @Test void invalidAndSuccessfulLinksRedirectToFrontendStates() throws Exception {
        mvc.perform(get("/api/auth/verify-email").param("token", "valid"))
                .andExpect(status().isFound()).andExpect(redirectedUrl("http://localhost:5173/login?verified=true"));
        doThrow(new ApiException(ErrorCode.VERIFY_TOKEN_INVALID)).when(accounts).verifyEmail("expired");
        mvc.perform(get("/api/auth/verify-email").param("token", "expired"))
                .andExpect(status().isFound()).andExpect(redirectedUrl("http://localhost:5173/login?verification=invalid"));
    }

    @Test void pendingAccountRejectionIsClientErrorInsteadOfUnexpectedServerError() throws Exception {
        when(auth.login(any())).thenThrow(new DisabledException("disabled"));
        mvc.perform(post("/api/auth/tokens").contentType("application/json")
                .content("{\"email\":\"guest@example.com\",\"password\":\"password\"}"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value(4030));
    }
}
