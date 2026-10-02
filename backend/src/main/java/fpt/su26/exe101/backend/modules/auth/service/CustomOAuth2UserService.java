package fpt.su26.exe101.backend.modules.auth.service;

import fpt.su26.exe101.backend.base.security.JwtTokenProvider;
import fpt.su26.exe101.backend.modules.auth.service.AccountService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.annotation.Lazy;

import java.util.Map;
import java.util.Collections;

@Slf4j
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final AccountService accountService;
    private final JwtTokenProvider tokenProvider;

    public CustomOAuth2UserService(@Lazy AccountService accountService, JwtTokenProvider tokenProvider) {
        this.accountService = accountService;
        this.tokenProvider = tokenProvider;
    }

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");

        accountService.createOAuthAccount(email, name);
        log.info("[AUTH] Google OAuth account processed");

        // We return the OAuth2User, but the actual JWT issuance is typically handled
        // by a SuccessHandler or a custom controller endpoint in a decoupled SPA architecture.
        // For this implementation, we've ensured the user is in our DB.

        return new DefaultOAuth2User(
            Collections.singleton(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ATTENDANCE")),
            attributes,
            "email"
        );
    }
}
