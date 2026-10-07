package fpt.su26.exe101.backend.modules.auth.service;

import fpt.su26.exe101.backend.modules.auth.dto.request.ForgotPasswordRequestDTO;
import fpt.su26.exe101.backend.modules.auth.dto.request.ResetPasswordRequestDTO;

public interface RecoveryService {
    void forgotPassword(ForgotPasswordRequestDTO request);

    void resetPassword(ResetPasswordRequestDTO request);
}
