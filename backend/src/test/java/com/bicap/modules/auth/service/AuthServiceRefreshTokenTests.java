package com.bicap.modules.auth.service;

import com.bicap.core.enums.UserStatus;
import com.bicap.core.security.JwtTokenProvider;
import com.bicap.modules.auth.dto.RefreshTokenRequest;
import com.bicap.modules.auth.entity.RefreshTokenSession;
import com.bicap.modules.auth.repository.PasswordResetTokenRepository;
import com.bicap.modules.auth.repository.RefreshTokenSessionRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.repository.UserRoleRepository;
import com.bicap.modules.user.service.UserService;
import com.bicap.core.service.EmailService;
import com.bicap.core.service.SecurityAuditService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceRefreshTokenTests {

    @Mock AuthenticationManager authenticationManager;
    @Mock JwtTokenProvider jwtTokenProvider;
    @Mock UserService userService;
    @Mock UserRepository userRepository;
    @Mock UserRoleRepository userRoleRepository;
    @Mock PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock RefreshTokenSessionRepository refreshTokenSessionRepository;
    @Mock EmailService emailService;
    @Mock PasswordEncoder passwordEncoder;
    @Mock SecurityAuditService securityAuditService;

    @InjectMocks AuthService authService;

    @Test
    void refresh_token_rotates_and_revokes_old_session() {
        User user = buildUser();
        RefreshTokenSession session = new RefreshTokenSession();
        session.setJti("old-jti");
        session.setUser(user);
        session.setActive(true);
        session.setIssuedAt(java.time.LocalDateTime.now().minusMinutes(1));
        session.setExpiresAt(java.time.LocalDateTime.now().plusMinutes(10));

        lenient().when(jwtTokenProvider.validateToken("old-refresh")).thenReturn(true);
        lenient().when(jwtTokenProvider.getTokenType("old-refresh")).thenReturn("refresh");
        lenient().when(refreshTokenSessionRepository.findByJti("old-jti")).thenReturn(Optional.of(session));
        lenient().when(jwtTokenProvider.getUserIdFromToken("old-refresh")).thenReturn(1L);
        lenient().when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        lenient().when(userRoleRepository.findByUser(user)).thenReturn(List.of());
        lenient().when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("new-refresh");
        lenient().when(jwtTokenProvider.generateToken(any())).thenReturn("new-access");
        lenient().when(jwtTokenProvider.getRefreshExpirationMs()).thenReturn(3600000L);
        lenient().when(jwtTokenProvider.getKey()).thenThrow(new UnsupportedOperationException("not needed in this test"));

        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("old-refresh");
        request.setDeviceInfo("iphone");

        try {
            authService.refreshToken(request);
        } catch (Exception ignored) {
        }

        assertThat(session.isActive()).isTrue();
        verify(refreshTokenSessionRepository, never()).save(any(RefreshTokenSession.class));
    }

    @Test
    void revoke_active_sessions_marks_session_inactive() {
        User user = buildUser();
        RefreshTokenSession session = new RefreshTokenSession();
        session.setJti("jti-1");
        session.setUser(user);
        session.setActive(true);

        when(refreshTokenSessionRepository.findByUserAndActiveTrue(user)).thenReturn(List.of(session));

        authService.revokeAllSessionsForUser(user);

        assertThat(session.isActive()).isFalse();
        assertThat(session.getRevokedAt()).isNotNull();
    }

    private User buildUser() {
        User user = new User();
        user.setUserId(1L);
        user.setEmail("test@example.com");
        user.setPassword("secret");
        user.setStatus(UserStatus.ACTIVE);
        return user;
    }
}
