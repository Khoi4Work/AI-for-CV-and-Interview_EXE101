package fpt.su26.exe101.backend.modules.auth.service;

import fpt.su26.exe101.backend.modules.auth.entity.Account;

public interface EmailVerificationService {
    void issue(Account account);

    void resend(String email, String ip);

    void verify(String token);
}
