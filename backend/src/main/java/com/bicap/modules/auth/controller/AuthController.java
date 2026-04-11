package com.bicap.modules.auth.controller;
import com.bicap.modules.user.entity.User;

import com.bicap.modules.user.entity.User;

import com.bicap.core.dto.ApiResponse;

import com.bicap.modules.user.dto.UserResponse;
import com.bicap.modules.auth.dto.LoginRequest;
import com.bicap.modules.auth.dto.LoginResponse;
import com.bicap.modules.auth.dto.RefreshTokenRequest;
import com.bicap.modules.auth.dto.RegisterRequest;
import com.bicap.modules.auth.dto.TokenRefreshResponse;
import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    // Manual Constructor instead of @RequiredArgsConstructor
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success("Đăng ký thành công", authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success("Đăng nhập thành công", authService.login(request));
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> me() {
        return ApiResponse.success("Lấy hồ sơ cá nhân thành công", authService.me());
    }

    @PostMapping("/refresh")
    public ApiResponse<TokenRefreshResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.success("Làm mới token thành công", authService.refreshToken(request));
    }

    @PostMapping("/logout")
    public ApiResponse<Map<String, String>> logout() {
        return ApiResponse.success("Đăng xuất thành công", authService.logout());
    }
}
