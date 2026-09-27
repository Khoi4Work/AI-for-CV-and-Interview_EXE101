package fpt.su26.exe101.backend.modules.auth.service;

import fpt.su26.exe101.backend.modules.auth.dto.request.InvitePartnerRequestDTO;
import fpt.su26.exe101.backend.modules.auth.dto.response.GenericResponseDTO;
import fpt.su26.exe101.backend.modules.auth.entity.Invitation;
import fpt.su26.exe101.backend.modules.auth.repository.InvitationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvitationService {
    private final InvitationRepository invitationRepository;

    @Transactional
    public GenericResponseDTO invitePartner(UUID inviterId, InvitePartnerRequestDTO request) {
        Invitation invitation = Invitation.builder()
                .email(request.getEmail())
                .role(fpt.su26.exe101.backend.modules.auth.entity.enums.AccountRole.valueOf(request.getRole().toUpperCase()))
                .token(UUID.randomUUID().toString())
                .status(fpt.su26.exe101.backend.modules.auth.entity.enums.InvitationStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();


        invitation = invitationRepository.save(invitation);

        return GenericResponseDTO.builder()
                .message("Invitation sent successfully")
                .id(invitation.getId().toString())
                .build();
    }
}
