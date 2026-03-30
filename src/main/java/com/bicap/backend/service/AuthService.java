package com.bicap.backend.service;

import com.bicap.backend.dto.UserResponse;
import com.bicap.backend.dto.auth.LoginRequest;
import com.bicap.backend.dto.auth.LoginResponse;
import com.bicap.backend.dto.request.CreateUserRequest;
import com.bicap.backend.security.CustomUserPrincipal;
import com.bicap.backend.security.JwtTokenProvider;
import com.bicap.backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    public UserResponse register(CreateUserRequest request) {
        return userService.registerPublicUser(request);
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
        UserResponse user = userService.getUserById(principal.getUserId());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getJwtExpirationMs())
                .user(user)
                .build();
    }

    public UserResponse getCurrentUserProfile() {
        return userService.getUserById(SecurityUtils.getCurrentUserId());
    }

    public Map<String, String> logout() {
        return Map.of(
                "logoutMode", "CLIENT_SIDE",
                "message", "Xóa access token ở phía client để hoàn tất đăng xuất"
        );
    }
}