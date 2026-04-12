<<<<<<< Updated upstream:backend/src/main/java/com/bicap/backend/controller/AuthController.java
package com.bicap.backend.controller;

import com.bicap.backend.dto.UserResponse;
import com.bicap.backend.dto.auth.LoginRequest;
import com.bicap.backend.dto.auth.LoginResponse;
import com.bicap.backend.dto.auth.RefreshTokenRequest;
import com.bicap.backend.dto.auth.RegisterRequest;
import com.bicap.backend.dto.auth.TokenRefreshResponse;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.service.AuthService;
=======
package com.bicap.modules.auth.controller;

import com.bicap.modules.auth.dto.*;
import com.bicap.modules.user.dto.UserResponse;
import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.auth.service.AuthService;
>>>>>>> Stashed changes:backend/src/main/java/com/bicap/modules/auth/controller/AuthController.java
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
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

    @PostMapping("/forgot-password")
    public ApiResponse<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ApiResponse.success(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ApiResponse<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ApiResponse.success(authService.resetPassword(request));
    }
}
