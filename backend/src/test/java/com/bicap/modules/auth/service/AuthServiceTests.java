package com.bicap.modules.auth.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.JwtTokenProvider;
import com.bicap.core.service.EmailService;
import com.bicap.core.service.SecurityAuditService;
import com.bicap.modules.auth.dto.ChangePasswordRequest;
import com.bicap.modules.auth.entity.RefreshTokenSession;
import com.bicap.modules.auth.repository.PasswordResetTokenRepository;
import com.bicap.modules.auth.repository.RefreshTokenSessionRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.repository.UserRoleRepository;
import com.bicap.modules.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTests {

    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private UserService userService;
    @Mock private UserRepository userRepository;
    @Mock private UserRoleRepository userRoleRepository;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private RefreshTokenSessionRepository refreshTokenSessionRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private SecurityAuditService securityAuditService;
    @Mock private EmailService emailService;

    @Test
    void changePassword_shouldRejectBadCurrentPasswordAndKeepSessionsActive() {
        AuthService service = newService();
        User user = new User();
        user.setUserId(42L);
        user.setEmail("farmer@example.com");
        user.setPassword("encoded-old");

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("wrong-old");
        request.setNewPassword("NewPassword1");

        when(userRepository.findById(42L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-old", "encoded-old")).thenReturn(false);

        try (var security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(42L);

            assertThatThrownBy(() -> service.changePassword(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("hiện tại không đúng");
        }

        verify(userRepository, never()).save(any(User.class));
        verify(refreshTokenSessionRepository, never()).findByUserAndActiveTrue(any(User.class));
        verify(securityAuditService).logAuthFailure("farmer@example.com", "CHANGE_PASSWORD", "BAD_CURRENT_PASSWORD");
    }

    @Test
    void changePassword_shouldHashNewPasswordAndRevokeActiveSessions() {
        AuthService service = newService();
        User user = new User();
        user.setUserId(42L);
        user.setEmail("farmer@example.com");
        user.setPassword("encoded-old");
        RefreshTokenSession session = new RefreshTokenSession();

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("OldPassword1");
        request.setNewPassword("NewPassword1");

        when(userRepository.findById(42L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("OldPassword1", "encoded-old")).thenReturn(true);
        when(passwordEncoder.matches("NewPassword1", "encoded-old")).thenReturn(false);
        when(passwordEncoder.encode("NewPassword1")).thenReturn("encoded-new");
        when(refreshTokenSessionRepository.findByUserAndActiveTrue(user)).thenReturn(List.of(session));

        try (var security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(42L);
            service.changePassword(request);
        }

        verify(userRepository).save(user);
        verify(refreshTokenSessionRepository).save(session);
        verify(securityAuditService).logAuthSuccess("farmer@example.com", "CHANGE_PASSWORD");
        verify(securityAuditService).logDomainAction(eq(42L), eq("CHANGE_PASSWORD"), eq("AUTH"), eq(42L), any(String.class));
    }

    private AuthService newService() {
        return new AuthService(
                authenticationManager,
                jwtTokenProvider,
                userService,
                userRepository,
                userRoleRepository,
                passwordResetTokenRepository,
                refreshTokenSessionRepository,
                passwordEncoder,
                securityAuditService,
                emailService
        );
    }
}
