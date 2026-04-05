package com.bicap.backend.controller;

import com.bicap.backend.dto.UserResponse;
import com.bicap.backend.dto.auth.LoginRequest;
import com.bicap.backend.dto.auth.LoginResponse;
import com.bicap.backend.dto.auth.RefreshTokenRequest;
import com.bicap.backend.dto.auth.RegisterRequest;
import com.bicap.backend.dto.auth.TokenRefreshResponse;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

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
