package fpt.su26.exe101.backend.base.security;

import fpt.su26.exe101.backend.modules.auth.entity.Account;
import fpt.su26.exe101.backend.modules.auth.entity.enums.AccountRole;
import fpt.su26.exe101.backend.modules.auth.repository.AccountRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AccountAuthenticationStatusTest {
    private final AccountRepository repository = mock(AccountRepository.class);
    private final CustomUserDetailsService detailsService = new CustomUserDetailsService(repository);
    private final JwtTokenProvider tokens = mock(JwtTokenProvider.class);
    private final JwtAuthenticationFilter filter = new JwtAuthenticationFilter(tokens, detailsService);

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @ParameterizedTest
    @ValueSource(strings = {"PENDING_VERIFICATION", "SUSPENDED", "UNKNOWN"})
    void inactiveAccountCannotFallBackToGuestWithPreviouslyIssuedJwt(String status) throws Exception {
        when(repository.findByEmail("user@example.com")).thenReturn(Optional.of(account(status)));
        FilterRun run = runFilter(filter, "valid-token", true);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals(HttpServletResponse.SC_UNAUTHORIZED, run.response().getStatus());
        verify(run.chain(), never()).doFilter(any(), any());
        assertFalse(detailsService.loadUserByUsername("user@example.com").isEnabled());
    }

    @Test
    void removedAccountCannotFallBackToGuestWithPreviouslyIssuedJwt() throws Exception {
        when(repository.findByEmail("user@example.com")).thenReturn(Optional.empty());
        FilterRun run = runFilter(filter, "valid-token", true);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals(HttpServletResponse.SC_UNAUTHORIZED, run.response().getStatus());
        verify(run.chain(), never()).doFilter(any(), any());
        assertThrows(UsernameNotFoundException.class,
                () -> detailsService.loadUserByUsername("user@example.com"));
    }

    @Test
    void missingBearerTokenContinuesAsAnonymousForPublicEndpoints() throws Exception {
        FilterRun run = runFilter(filter, null, false);

        assertEquals(HttpServletResponse.SC_OK, run.response().getStatus());
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(run.chain()).doFilter(any(), any());
    }

    @Test
    void invalidBearerTokenIsRejectedInsteadOfFallingBackToGuest() throws Exception {
        when(tokens.validateAccessToken("expired-token")).thenReturn(false);
        FilterRun run = runFilter(filter, "expired-token", true);

        assertEquals(HttpServletResponse.SC_UNAUTHORIZED, run.response().getStatus());
        assertEquals("Bearer error=\"invalid_token\"", run.response().getHeader("WWW-Authenticate"));
        verify(run.chain(), never()).doFilter(any(), any());
    }

    @Test
    void activeGoogleAccountWithNullPasswordCanAuthenticateWithJwt() throws Exception {
        Account account = account("ACTIVE");
        account.setPasswordHash(null);
        when(repository.findByEmail("user@example.com")).thenReturn(Optional.of(account));
        FilterRun run = runFilter(filter, "valid-token", true);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertTrue(SecurityContextHolder.getContext().getAuthentication().isAuthenticated());
        assertEquals("user@example.com", SecurityContextHolder.getContext().getAuthentication().getName());
        verify(run.chain()).doFilter(any(), any());
    }

    @Test
    void passwordAuthenticationRejectsPendingAccountBeforeMatchingPassword() {
        when(repository.findByEmail("user@example.com")).thenReturn(Optional.of(account("PENDING_VERIFICATION")));
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(detailsService);
        provider.setPasswordEncoder(encoder);
        assertThrows(DisabledException.class, () -> provider.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated("user@example.com", "password")));
        verify(encoder, never()).matches(any(), any());
    }

    @Test
    void lockedAndExpiredDetailsCannotFallBackToGuestWithJwt() throws Exception {
        for (int invalidFlag = 0; invalidFlag < 3; invalidFlag++) {
            CustomUserDetailsService service = mock(CustomUserDetailsService.class);
            UserDetails details = mock(UserDetails.class);
            when(details.isEnabled()).thenReturn(true);
            when(details.isAccountNonLocked()).thenReturn(invalidFlag != 0);
            when(details.isAccountNonExpired()).thenReturn(invalidFlag != 1);
            when(details.isCredentialsNonExpired()).thenReturn(invalidFlag != 2);
            when(service.loadUserByUsername("user@example.com")).thenReturn(details);
            FilterRun run = runFilter(new JwtAuthenticationFilter(tokens, service), "valid-token", true);

            assertNull(SecurityContextHolder.getContext().getAuthentication());
            assertEquals(HttpServletResponse.SC_UNAUTHORIZED, run.response().getStatus());
            verify(run.chain(), never()).doFilter(any(), any());
        }
    }

    private Account account(String status) {
        return Account.builder().email("user@example.com").passwordHash("hash")
                .role(AccountRole.ATTENDANCE).status(status).build();
    }

    private FilterRun runFilter(JwtAuthenticationFilter target, String token, boolean includeToken) throws Exception {
        if ("valid-token".equals(token)) {
            when(tokens.validateAccessToken("valid-token")).thenReturn(true);
            when(tokens.getUsernameFromToken("valid-token")).thenReturn("user@example.com");
        }

        MockHttpServletRequest request = new MockHttpServletRequest();
        if (includeToken) request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);
        target.doFilter(request, response, chain);
        return new FilterRun(chain, response);
    }

    private record FilterRun(FilterChain chain, MockHttpServletResponse response) {}
}
