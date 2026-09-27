package fpt.su26.exe101.backend.modules.auth.service;

import fpt.su26.exe101.backend.modules.auth.dto.request.*;
import fpt.su26.exe101.backend.modules.auth.dto.response.*;
import fpt.su26.exe101.backend.modules.auth.entity.Account;

public interface AccountService {
    RegisterResponseDTO register(RegisterRequestDTO request);
    void verifyEmail(String token);
    Account createOAuthAccount(String email, String name);
    void updateProfile(java.util.UUID accountId, UpdateProfileRequestDTO request);
    Account getAccountByEmail(String email);
    void changePassword(String email, ChangePasswordRequestDTO request);
}
