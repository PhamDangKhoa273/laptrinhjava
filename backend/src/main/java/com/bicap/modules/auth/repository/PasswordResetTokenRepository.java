package com.bicap.modules.auth.repository;

import com.bicap.modules.auth.entity.PasswordResetToken;
import com.bicap.modules.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);
    Optional<PasswordResetToken> findByUser(User user);
    List<PasswordResetToken> findByUserAndRevokedAtIsNull(User user);
    void deleteByUser(User user);
}
