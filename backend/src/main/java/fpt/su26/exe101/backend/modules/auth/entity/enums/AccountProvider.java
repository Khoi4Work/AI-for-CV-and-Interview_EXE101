package fpt.su26.exe101.backend.modules.auth.entity.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AccountProvider {
    LOCAL("Local Registration"),
    GOOGLE("Google OAuth2");

    private final String description;
}
