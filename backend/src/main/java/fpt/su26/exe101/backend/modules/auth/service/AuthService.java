package fpt.su26.exe101.backend.modules.auth.service;

import fpt.su26.exe101.backend.modules.auth.dto.request.*;
import fpt.su26.exe101.backend.modules.auth.dto.response.*;

public interface AuthService {
    AuthResponseDTO login(LoginRequestDTO request);
    TokenRefreshResponseDTO refresh(RefreshTokenRequestDTO request);
    AuthResponseDTO socialLogin(String provider, OAuthRequestDTO request);
    void logout(String refreshToken);
}
