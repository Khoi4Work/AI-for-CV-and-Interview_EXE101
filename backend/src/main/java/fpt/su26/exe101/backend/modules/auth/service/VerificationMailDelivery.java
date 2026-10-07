package fpt.su26.exe101.backend.modules.auth.service;

import java.util.UUID;

public interface VerificationMailDelivery {
    void deliver(UUID id);
}
