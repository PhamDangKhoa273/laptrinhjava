package com.bicap.backend.service;

import com.bicap.backend.dto.UserResponse;
import com.bicap.backend.dto.auth.LoginRequest;
import com.bicap.backend.dto.auth.LoginResponse;
import com.bicap.backend.dto.auth.RefreshTokenRequest;
import com.bicap.backend.dto.auth.RegisterRequest;
import com.bicap.backend.dto.auth.TokenRefreshResponse;
import com.bicap.backend.entity.User;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.UserRepository;
import com.bicap.backend.repository.UserRoleRepository;
import com.bicap.backend.security.CustomUserPrincipal;
import com.bicap.backend.security.JwtTokenProvider;
import com.bicap.backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.bicap.backend.enums.RoleName.GUEST;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final UserService userService;

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
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().trim().toLowerCase(),
                        request.getPassword()
                )
        );

        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        String accessToken = jwtTokenProvider.generateToken(principal);
        String refreshToken = jwtTokenProvider.generateRefreshToken(principal);

        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy user"));

        UserResponse userResponse = userService.getUserById(user.getUserId());

        List<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return LoginResponse.builder()
                .token(accessToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getJwtExpirationMs())
                .refreshToken(refreshToken)
                .refreshExpiresIn(jwtTokenProvider.getRefreshExpirationMs())
                .user(userResponse)
                .roles(roles)
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

        List<String> roles = userRoleRepository.findByUser(user).stream()
                .map(userRole -> "ROLE_" + userRole.getRole().getRoleName())
                .toList();

        CustomUserPrincipal principal = new CustomUserPrincipal(
                user.getUserId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getStatus(),
                roles.stream().map(SimpleGrantedAuthority::new).toList()
        );

        return TokenRefreshResponse.builder()
                .token(jwtTokenProvider.generateToken(principal))
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getJwtExpirationMs())
                .refreshToken(jwtTokenProvider.generateRefreshToken(principal))
                .refreshExpiresIn(jwtTokenProvider.getRefreshExpirationMs())
                .build();
    }

    public String logout() {
        return "Đăng xuất thành công. Client hãy xoá access token và refresh token ở phía local.";
    }
}
