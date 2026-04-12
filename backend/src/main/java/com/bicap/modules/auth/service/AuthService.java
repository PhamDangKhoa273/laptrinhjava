package com.bicap.modules.auth.service;

import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.service.UserService;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.repository.UserRoleRepository;
import com.bicap.modules.user.dto.UserResponse;
import com.bicap.modules.auth.dto.*;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.auth.entity.PasswordResetToken;
import com.bicap.modules.auth.repository.PasswordResetTokenRepository;
import com.bicap.core.service.EmailService;
import com.bicap.core.security.CustomUserPrincipal;
import com.bicap.core.security.JwtTokenProvider;
import com.bicap.core.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import static com.bicap.core.enums.RoleName.GUEST;

@Service
@SuppressWarnings("null")
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    // Manual Constructor
    public AuthService(AuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider,
                       UserService userService,
                       UserRepository userRepository,
                       UserRoleRepository userRoleRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       EmailService emailService,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        User savedUser = userService.createUser(
                request.getFullName(),
                request.getEmail(),
                request.getPassword(),
                request.getPhone(),
                request.getAvatarUrl(),
                GUEST
        );

        return userService.getUserById(savedUser.getUserId());
    }

    public LoginResponse login(LoginRequest request) {
        System.out.println("Processing login attempt for: " + request.getEmail().trim().toLowerCase());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().trim().toLowerCase(),
                        request.getPassword()
                )
        );

        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        String accessToken = jwtTokenProvider.generateToken(principal);
        String refreshToken = jwtTokenProvider.generateRefreshToken(principal);

        UserResponse user = userService.getUserById(principal.getUserId());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getJwtExpirationMs())
                .refreshToken(refreshToken)
                .refreshExpiresIn(jwtTokenProvider.getRefreshExpirationMs())
                .user(user)
                .build();
    }

    public UserResponse me() {
        return userService.getUserById(SecurityUtils.getCurrentUserId());
    }

    public TokenRefreshResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException("Refresh token không hợp lệ");
        }

        if (!"refresh".equals(jwtTokenProvider.getTokenType(refreshToken))) {
            throw new BusinessException("Sai loại token");
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user"));

        var authorities = userRoleRepository.findByUser(user).stream()
                .map(userRole -> new SimpleGrantedAuthority("ROLE_" + userRole.getRole().getRoleName()))
                .toList();

        CustomUserPrincipal principal = new CustomUserPrincipal(
                user.getUserId(),
                user.getEmail(),
                user.getPassword(),
                user.getStatus() != null ? user.getStatus().name() : null,
                authorities
        );

        return TokenRefreshResponse.builder()
                .accessToken(jwtTokenProvider.generateToken(principal))
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getJwtExpirationMs())
                .refreshToken(jwtTokenProvider.generateRefreshToken(principal))
                .refreshExpiresIn(jwtTokenProvider.getRefreshExpirationMs())
                .build();
    }

    public Map<String, String> logout() {
        return Map.of(
                "logoutMode", "CLIENT_SIDE",
                "message", "Xóa access token và refresh token ở phía client để hoàn tất đăng xuất"
        );
    }

    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail().toLowerCase())
                .orElseThrow(() -> new BusinessException("Không tìm thấy người dùng với email này"));

        // Delete old tokens
        passwordResetTokenRepository.deleteByUser(user);

        // Generate new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user, LocalDateTime.now().plusMinutes(30));

        passwordResetTokenRepository.save(resetToken);

        // Send Email
        String resetLink = String.format("%s/reset-password?token=%s", frontendUrl, token);
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);

        return "Link khôi phục mật khẩu đã được gửi đến email của bạn.";
    }

    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BusinessException("Token không hợp lệ hoặc đã hết hạn"));

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new BusinessException("Token đã hết hạn");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);

        return "Mật khẩu của bạn đã được cập nhật thành công.";
    }
}
