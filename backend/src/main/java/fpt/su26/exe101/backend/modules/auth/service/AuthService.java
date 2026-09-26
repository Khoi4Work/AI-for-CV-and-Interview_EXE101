package fpt.su26.exe101.backend.modules.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.base.security.JwtTokenProvider;
import fpt.su26.exe101.backend.modules.auth.dto.request.*;
import fpt.su26.exe101.backend.modules.auth.dto.response.*;
import fpt.su26.exe101.backend.modules.auth.entity.*;
import fpt.su26.exe101.backend.modules.auth.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
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

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

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
                Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + account.getRole().name()))
        );

        return TokenRefreshResponse.builder()
                .accessToken(accessToken)
                .build();
    }

    public AuthResponse socialLogin(String provider, OAuthRequest request) {
        if (!"google".equalsIgnoreCase(provider)) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Only Google login is currently supported");
        }

        String email = verifyGoogleToken(request.getToken());

        Account account = accountRepository.findByEmail(email)
                .orElseGet(() -> accountService.createOAuthAccount(email, "OAuth User"));

        if ("SUSPENDED".equals(account.getStatus())) {
            throw new RuntimeException("Account is suspended");
        }

        String accessToken = tokenProvider.createToken(
                account.getEmail(),
                Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + account.getRole().name()))
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

    private String verifyGoogleToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                return idToken.getPayload().getEmail();
            } else {
                throw new ApiException(ErrorCode.INVALID_INPUT, "Invalid Google ID token");
            }
        } catch (Exception e) {
            if (e instanceof ApiException) {
                throw (ApiException) e;
            }
            throw new ApiException(ErrorCode.INVALID_INPUT, "Error verifying Google token: " + e.getMessage());
        }
    }

    @Transactional
    public void logout(String refreshToken) {
        Token token = tokenRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));
        tokenRepository.delete(token);
    }
}