package fpt.su26.exe101.backend.base.security;

import fpt.su26.exe101.backend.modules.auth.entity.Account;
import fpt.su26.exe101.backend.modules.auth.entity.enums.AccountRole;
import fpt.su26.exe101.backend.modules.auth.repository.AccountRepository;
import jakarta.servlet.FilterChain;
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
    void disabledAccountCannotUsePreviouslyIssuedJwt(String status) throws Exception {
        when(repository.findByEmail("user@example.com")).thenReturn(Optional.of(account(status)));
        FilterChain chain = runFilter();
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(chain).doFilter(any(), any());
        assertFalse(detailsService.loadUserByUsername("user@example.com").isEnabled());
    }

    @Test
    void removedAccountContinuesFilterChainWithoutAuthentication() throws Exception {
        when(repository.findByEmail("user@example.com")).thenReturn(Optional.empty());
        FilterChain chain = runFilter();
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(chain).doFilter(any(), any());
        assertThrows(UsernameNotFoundException.class,
                () -> detailsService.loadUserByUsername("user@example.com"));
    }

    @Test
    void activeGoogleAccountWithNullPasswordCanAuthenticateWithJwt() throws Exception {
        Account account = account("ACTIVE");
        account.setPasswordHash(null);
        when(repository.findByEmail("user@example.com")).thenReturn(Optional.of(account));
        runFilter();
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertTrue(SecurityContextHolder.getContext().getAuthentication().isAuthenticated());
        assertEquals("user@example.com", SecurityContextHolder.getContext().getAuthentication().getName());
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
    void lockedAndExpiredDetailsCannotAuthenticateWithJwt() throws Exception {
        for (int invalidFlag = 0; invalidFlag < 3; invalidFlag++) {
            CustomUserDetailsService service = mock(CustomUserDetailsService.class);
            UserDetails details = mock(UserDetails.class);
            when(details.isEnabled()).thenReturn(true);
            when(details.isAccountNonLocked()).thenReturn(invalidFlag != 0);
            when(details.isAccountNonExpired()).thenReturn(invalidFlag != 1);
            when(details.isCredentialsNonExpired()).thenReturn(invalidFlag != 2);
            when(service.loadUserByUsername("user@example.com")).thenReturn(details);
            runFilter(new JwtAuthenticationFilter(tokens, service));
            assertNull(SecurityContextHolder.getContext().getAuthentication());
        }
    }

    private Account account(String status) {
        return Account.builder().email("user@example.com").passwordHash("hash")
                .role(AccountRole.ATTENDANCE).status(status).build();
    }

    private FilterChain runFilter() throws Exception {
        return runFilter(filter);
    }

    private FilterChain runFilter(JwtAuthenticationFilter target) throws Exception {
        when(tokens.validateAccessToken("valid-token")).thenReturn(true);
        when(tokens.getUsernameFromToken("valid-token")).thenReturn("user@example.com");
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer valid-token");
        FilterChain chain = mock(FilterChain.class);
        target.doFilter(request, new MockHttpServletResponse(), chain);
        return chain;
    }
}
