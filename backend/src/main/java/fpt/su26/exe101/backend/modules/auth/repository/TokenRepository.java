package fpt.su26.exe101.backend.modules.auth.repository;

import fpt.su26.exe101.backend.modules.auth.entity.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TokenRepository extends JpaRepository<Token, UUID> {
    Optional<Token> findByRefreshToken(String tokenValue);
    Optional<Token> findByAccount(fpt.su26.exe101.backend.modules.auth.entity.Account account);
    void deleteByAccount(fpt.su26.exe101.backend.modules.auth.entity.Account account);
}
