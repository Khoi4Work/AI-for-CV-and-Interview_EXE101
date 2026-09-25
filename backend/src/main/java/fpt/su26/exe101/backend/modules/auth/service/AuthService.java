package fpt.su26.exe101.backend.modules.auth.service;

import fpt.su26.exe101.backend.base.security.JwtTokenProvider;
import fpt.su26.exe101.backend.modules.auth.dto.request.*;
import fpt.su26.exe101.backend.modules.auth.dto.response.*;
import fpt.su26.exe101.backend.modules.auth.entity.*;
import fpt.su26.exe101.backend.modules.auth.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AccountRepository accountRepository;
    private final TokenRepository tokenRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AccountService accountService;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if ("PENDING_VERIFICATION".equals(account.getStatus())) {
            throw new RuntimeException("Account is SUSPENDED or email not verified");
        }

        String accessToken = tokenProvider.createToken(authentication);
        String refreshToken = tokenProvider.createRefreshToken(account.getEmail());

        Token token = Token.builder()
                .account(account)
                .refreshToken(refreshToken)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        tokenRepository.save(token);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role(account.getRole().name())
                .status(account.getStatus())
                .build();
    }

    public TokenRefreshResponse refresh(RefreshTokenRequest request) {
        Token token = tokenRepository.findByRefreshToken(request.getRefreshToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired refresh token"));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired refresh token");
        }

        Account account = token.getAccount();
        String accessToken = tokenProvider.createToken(
                account.getEmail(),
                java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + account.getRole().name()))
        );

        return TokenRefreshResponse.builder()
                .accessToken(accessToken)
                .build();
    }

    public AuthResponse socialLogin(String provider, OAuthRequest request) {
        // In production, we would validate the provider token here using Google/GitHub API.
        // For this implementation, we assume the token is validated or we rely on the email.

        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseGet(() -> accountService.createOAuthAccount(request.getEmail(), "OAuth User"));

        if ("SUSPENDED".equals(account.getStatus())) {
            throw new RuntimeException("Account is suspended");
        }

        String accessToken = tokenProvider.createToken(
                account.getEmail(),
                java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + account.getRole().name()))
        );
        String refreshToken = tokenProvider.createRefreshToken(account.getEmail());

        Token token = Token.builder()
                .account(account)
                .refreshToken(refreshToken)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        tokenRepository.save(token);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role(account.getRole().name())
                .status(account.getStatus())
                .build();
    }

    @Transactional
    public void logout(String refreshToken) {
        Token token = tokenRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));
        tokenRepository.delete(token);
    }
}
