package fpt.su26.exe101.backend.modules.admin;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.modules.auth.repository.InvitationRepository;
import fpt.su26.exe101.backend.modules.auth.service.impl.InvitationServiceImpl;
import fpt.su26.exe101.backend.modules.auth.dto.request.InvitePartnerRequestDTO;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class AdminInvitationTest {
    @Test void invitationCannotAssignAdmin() {
        InvitationRepository invitations=mock(InvitationRepository.class);
        assertThrows(ApiException.class,()->new InvitationServiceImpl(invitations)
                .invitePartner(null,InvitePartnerRequestDTO.builder().role("ADMIN").build()));
        verifyNoInteractions(invitations);
    }
}
