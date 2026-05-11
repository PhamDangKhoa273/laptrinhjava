package com.bicap.modules.auth.repository;

import com.bicap.modules.auth.entity.RefreshTokenSession;
import com.bicap.modules.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenSessionRepository extends JpaRepository<RefreshTokenSession, Long> {
    Optional<RefreshTokenSession> findByJti(String jti);
    List<RefreshTokenSession> findByUserAndActiveTrue(User user);
    List<RefreshTokenSession> findByUserAndRevokedAtIsNull(User user);
    long countByUserAndActiveTrue(User user);
    long countByUserAndExpiresAtBefore(User user, LocalDateTime cutoff);
}
