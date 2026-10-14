package fpt.su26.exe101.backend.modules.admin;

import fpt.su26.exe101.backend.base.security.JwtTokenProvider;
import fpt.su26.exe101.backend.modules.auth.dto.request.LoginRequestDTO;
import fpt.su26.exe101.backend.modules.auth.entity.Account;
import fpt.su26.exe101.backend.modules.auth.entity.enums.AccountRole;
import fpt.su26.exe101.backend.modules.auth.repository.*;
import fpt.su26.exe101.backend.modules.auth.service.AccountService;
import fpt.su26.exe101.backend.modules.auth.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminLoginTest {
    @Mock AccountRepository accounts;
    @Mock TokenRepository tokens;
    @Mock AuthenticationManager authentication;
    @Mock PasswordEncoder encoder;
    @Mock JwtTokenProvider jwt;
    @Mock AccountService accountService;
    @InjectMocks AuthServiceImpl service;
    @Test void adminAccountUsesTheNormalEmailAuthenticationFlow() {
        Account account=Account.builder().email("owner@example.test").role(AccountRole.ADMIN).status("ACTIVE").build();
        var auth=new UsernamePasswordAuthenticationToken("owner@example.test","password",List.of());
        when(authentication.authenticate(any())).thenReturn(auth);
        when(accounts.findByEmail("owner@example.test")).thenReturn(Optional.of(account));
        when(jwt.createToken(auth)).thenReturn("access");
        when(jwt.createRefreshToken(account.getEmail())).thenReturn("refresh");
        var response=service.login(LoginRequestDTO.builder().email(" OWNER@example.test ").password("password").build());
        assertEquals("ADMIN",response.getRole());
        assertEquals("access",response.getAccessToken());
        verify(authentication).authenticate(argThat(input->input.getName().equals("owner@example.test")));
    }
    @Test void usernameAdminIsNotMappedToAnAccount() {
        when(authentication.authenticate(any())).thenThrow(new BadCredentialsException("invalid"));
        assertThrows(BadCredentialsException.class,()->service.login(LoginRequestDTO.builder().email("admin").password("admin").build()));
        verify(authentication).authenticate(argThat(input->input.getName().equals("admin")));
        verifyNoInteractions(accounts,tokens,jwt);
    }
}
