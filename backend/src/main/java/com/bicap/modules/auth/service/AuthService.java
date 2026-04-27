package com.bicap.modules.auth.service;

import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.CustomUserPrincipal;
import com.bicap.core.security.JwtTokenProvider;
import com.bicap.core.security.SecurityUtils;
import com.bicap.core.service.EmailService;
import com.bicap.core.service.SecurityAuditService;
import com.bicap.modules.auth.dto.*;
import com.bicap.modules.auth.entity.PasswordResetToken;
import com.bicap.modules.auth.entity.RefreshTokenSession;
import com.bicap.modules.auth.repository.PasswordResetTokenRepository;
import com.bicap.modules.auth.repository.RefreshTokenSessionRepository;
import com.bicap.modules.user.dto.UserResponse;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.repository.UserRoleRepository;
import com.bicap.modules.user.service.UserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.ArrayDeque;
import java.util.Base64;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class AuthService {

    private static final Map<String, Deque<LocalDateTime>> PASSWORD_RESET_ATTEMPTS = new LinkedHashMap<>();
    private static final Set<RoleName> SELF_REGISTER_ROLES = Set.of(RoleName.GUEST, RoleName.FARM, RoleName.RETAILER, RoleName.SHIPPING_MANAGER);

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RefreshTokenSessionRepository refreshTokenSessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityAuditService securityAuditService;
    private final EmailService emailService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider,
                       UserService userService,
                       UserRepository userRepository,
                       UserRoleRepository userRoleRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       RefreshTokenSessionRepository refreshTokenSessionRepository,
                       PasswordEncoder passwordEncoder,
                       SecurityAuditService securityAuditService,
                       EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.refreshTokenSessionRepository = refreshTokenSessionRepository;
        this.passwordEncoder = passwordEncoder;
        this.securityAuditService = securityAuditService;
        this.emailService = emailService;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        RoleName requestedRole = request.getRole() != null ? request.getRole() : RoleName.GUEST;
        if (!SELF_REGISTER_ROLES.contains(requestedRole)) {
            throw new BusinessException("Chỉ được tự đăng ký tài khoản Guest, Farm hoặc Retailer");
        }

        UserResponse savedUser = userService.createUser(
                request.getFullName(),
                request.getEmail(),
                request.getPassword(),
                request.getPhone(),
                request.getAvatarUrl(),
                requestedRole
        );

        securityAuditService.logAuthSuccess(savedUser.getEmail(), "REGISTER");
        return savedUser;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );

            CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
            String accessToken = jwtTokenProvider.generateToken(principal);
            String refreshToken = jwtTokenProvider.generateRefreshToken(principal);
            User user = userRepository.findById(principal.getUserId())
                    .orElseThrow(() -> new BusinessException("Không tìm thấy user"));
            storeRefreshSession(user, refreshToken, request.getDeviceInfo(), "LOGIN");
            securityAuditService.logDomainAction(user.getUserId(), "LOGIN_SUCCESS", "AUTH", user.getUserId(), "email=" + email);
            UserResponse userResponse = userService.getUserById(principal.getUserId());

            securityAuditService.logAuthSuccess(email, "LOGIN");
            return LoginResponse.builder()
                    .accessToken(accessToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtTokenProvider.getJwtExpirationMs())
                    .refreshToken(refreshToken)
                    .refreshExpiresIn(jwtTokenProvider.getRefreshExpirationMs())
                    .user(userResponse)
                    .build();
        } catch (Exception ex) {
            securityAuditService.logAuthFailure(email, "LOGIN", ex.getClass().getSimpleName());
            securityAuditService.logDomainAction(null, "LOGIN_FAILURE", "AUTH", null, "email=" + email + ", reason=" + ex.getClass().getSimpleName());
            throw ex;
        }
    }

    public UserResponse me() {
        return userService.getUserById(SecurityUtils.getCurrentUserId());
    }

    @Transactional
    public String changePassword(ChangePasswordRequest request) {
        if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
            throw new BusinessException("Mật khẩu mới phải có ít nhất 8 ký tự");
        }

        Long currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            securityAuditService.logAuthFailure(user.getEmail(), "CHANGE_PASSWORD", "BAD_CURRENT_PASSWORD");
            throw new BusinessException("Mật khẩu hiện tại không đúng");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BusinessException("Mật khẩu mới phải khác mật khẩu hiện tại");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        revokeAllSessionsForUser(user);
        securityAuditService.logAuthSuccess(user.getEmail(), "CHANGE_PASSWORD");
        securityAuditService.logDomainAction(user.getUserId(), "CHANGE_PASSWORD", "AUTH", user.getUserId(), "self-service password update");
        return "Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại trên các thiết bị khác.";
    }

    @Transactional
    public TokenRefreshResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException("Refresh token không hợp lệ");
        }

        if (!"refresh".equals(jwtTokenProvider.getTokenType(refreshToken))) {
            throw new BusinessException("Sai loại token");
        }

        String jti = extractJti(refreshToken);
        RefreshTokenSession session = refreshTokenSessionRepository.findByJti(jti)
                .orElseThrow(() -> new BusinessException("Refresh token session không tồn tại"));
        if (!session.isActive() || session.getRevokedAt() != null) {
            throw new BusinessException("Refresh token đã bị thu hồi");
        }
        if (session.getExpiresAt() != null && session.getExpiresAt().isBefore(LocalDateTime.now())) {
            session.revoke("EXPIRED");
            refreshTokenSessionRepository.save(session);
            throw new BusinessException("Refresh token đã hết hạn");
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

        String nextRefreshToken = jwtTokenProvider.generateRefreshToken(principal);
        revokeSession(session, "ROTATED", nextRefreshToken);
        storeRefreshSession(user, nextRefreshToken, request.getDeviceInfo(), "ROTATION");

        return TokenRefreshResponse.builder()
                .accessToken(jwtTokenProvider.generateToken(principal))
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getJwtExpirationMs())
                .refreshToken(nextRefreshToken)
                .refreshExpiresIn(jwtTokenProvider.getRefreshExpirationMs())
                .build();
    }

    @Transactional
    public Map<String, String> logout() {
        Long currentUserId = SecurityUtils.getCurrentUserIdOrNull();
        if (currentUserId != null) {
            userRepository.findById(currentUserId).ifPresent(this::revokeAllSessionsForUser);
        }
        return Map.of(
                "logoutMode", "SERVER_SIDE",
                "message", "Refresh token đã bị thu hồi trên server"
        );
    }

    @Transactional
    public void revokeAllSessionsForUser(User user) {
        refreshTokenSessionRepository.findByUserAndActiveTrue(user).forEach(session -> {
            session.revoke("REVOKED");
            refreshTokenSessionRepository.save(session);
        });
    }

    @Transactional
    public void revokeOnPasswordReset(User user) {
        revokeAllSessionsForUser(user);
        passwordResetTokenRepository.deleteByUser(user);
    }

    @Transactional
    public String forgotPassword(ForgotPasswordRequest request, String clientIp) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        throttlePasswordReset(normalizedEmail, clientIp);

        userRepository.findByEmailIgnoreCase(normalizedEmail).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUser(user);
            String token = UUID.randomUUID().toString();
            String tokenHash = hashResetToken(token);
            PasswordResetToken resetToken = new PasswordResetToken(tokenHash, user, LocalDateTime.now().plusMinutes(15));
            passwordResetTokenRepository.save(resetToken);

            String resetLink = frontendUrl + "/reset-password?token=" + token;
            emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
            securityAuditService.logAuthSuccess(user.getEmail(), "FORGOT_PASSWORD");
        });

        return "Nếu email hợp lệ, chúng tôi đã gửi hướng dẫn khôi phục mật khẩu.";
    }

    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
            throw new BusinessException("Mật khẩu mới phải có ít nhất 8 ký tự");
        }

        String tokenHash = hashResetToken(request.getToken());
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BusinessException("Token không hợp lệ hoặc đã hết hạn"));

        if (resetToken.isExpired() || resetToken.isConsumed()) {
            resetToken.revoke();
            passwordResetTokenRepository.save(resetToken);
            securityAuditService.logAuthFailure(resetToken.getUser().getEmail(), "RESET_PASSWORD", "TOKEN_EXPIRED");
            throw new BusinessException("Token đã hết hạn");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.markUsed();
        passwordResetTokenRepository.save(resetToken);
        revokeOnPasswordReset(user);
        securityAuditService.logAuthSuccess(user.getEmail(), "RESET_PASSWORD");

        return "Mật khẩu của bạn đã được cập nhật thành công.";
    }

    private void storeRefreshSession(User user, String refreshToken, String deviceInfo, String reason) {
        String jti = extractClaim(refreshToken, Claims::getId);
        if (jti == null || jti.isBlank()) {
            // Defensive fallback (should not happen once JwtTokenProvider sets jti)
            jti = UUID.randomUUID().toString();
        }
        RefreshTokenSession session = new RefreshTokenSession();
        session.setJti(jti);
        session.setUser(user);
        session.setIssuedAt(LocalDateTime.now());
        session.setExpiresAt(LocalDateTime.now().plusSeconds(jwtTokenProvider.getRefreshExpirationMs() / 1000));
        session.setDeviceInfo(normalizeDeviceInfo(deviceInfo));
        session.setRefreshTokenHash(passwordEncoder.encode(refreshToken));
        session.setRotationReason(reason);
        session.setActive(true);
        refreshTokenSessionRepository.save(session);
    }

    private void revokeSession(RefreshTokenSession session, String reason, String replacedByToken) {
        session.revoke(reason);
        session.setReplacedByJti(replacedByToken != null ? extractJti(replacedByToken) : null);
        refreshTokenSessionRepository.save(session);
    }

    public void revokeAllSessionsForUserId(Long userId, String reason) {
        userRepository.findById(userId).ifPresent(user -> refreshTokenSessionRepository.findByUserAndActiveTrue(user).forEach(session -> {
            session.revoke(reason);
            refreshTokenSessionRepository.save(session);
        }));
    }

    private String normalizeDeviceInfo(String deviceInfo) {
        if (deviceInfo == null || deviceInfo.isBlank()) {
            return null;
        }
        return deviceInfo.trim();
    }

    private synchronized void throttlePasswordReset(String normalizedEmail, String clientIp) {
        // Demo/local environment: allow repeated password-reset testing without blocking.
        // Global API rate limiting still protects the endpoint.
        return;
    }

    private String hashResetToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(normalizeResetToken(token).getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 algorithm is not available", ex);
        }
    }

    private String normalizeResetToken(String token) {
        if (token == null || token.isBlank()) {
            throw new BusinessException("Token không hợp lệ hoặc đã hết hạn");
        }
        return token.trim();
    }

    private <T> T extractClaim(String token, java.util.function.Function<Claims, T> claimsResolver) {
        Claims claims = Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) jwtTokenProvider.getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claimsResolver.apply(claims);
    }

    private String extractJti(String token) {
        return extractClaim(token, claims -> claims.getId());
    }
}
