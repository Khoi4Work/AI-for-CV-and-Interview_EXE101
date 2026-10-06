package fpt.su26.exe101.backend.modules.auth.service;

import fpt.su26.exe101.backend.modules.auth.dto.request.InvitePartnerRequestDTO;
import fpt.su26.exe101.backend.modules.auth.dto.response.GenericResponseDTO;

import java.util.UUID;

public interface InvitationService {
    GenericResponseDTO invitePartner(UUID inviterId, InvitePartnerRequestDTO request);
}
