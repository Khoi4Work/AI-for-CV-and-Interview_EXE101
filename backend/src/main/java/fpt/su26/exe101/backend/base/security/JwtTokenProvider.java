package fpt.su26.exe101.backend.base.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JwtTokenProvider {
    private final SecretKey key;
    private final long accessTokenValidity = 3600000; // 1 hour
    private final long refreshTokenValidity = 604800000; // 7 days

    public JwtTokenProvider(@Value("${app.jwt.secret:defaultSecretKeyForDevelopmentPurposesOnly1234567890}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String createToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return createToken(userDetails.getUsername(), userDetails.getAuthorities());
    }

    public String createToken(String username, java.util.Collection<? extends GrantedAuthority> authorities) {
        String claims = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        return Jwts.builder()
                .subject(username)
                .claim("roles", claims)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenValidity))
                .signWith(key)
                .compact();
    }

    public String createRefreshToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenValidity))
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("[AUTH] JWT validation rejected a token | errorType={}", e.getClass().getSimpleName());
        }
        return false;
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public java.util.Collection<? extends GrantedAuthority> getAuthoritiesFromToken(String token) {
        String roles = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("roles", String.class);

        if (roles == null) return java.util.Collections.emptyList();

        return java.util.Arrays.stream(roles.split(","))
                .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority(role))
                .collect(Collectors.toList());
    }
}
