package fpt.su26.exe101.backend.modules.auth.service;

public interface VerificationRateLimiter {
    void check(String email, String ip);
}
