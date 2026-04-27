package com.bicap.modules.auth.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.core.security.ClientIpResolver;
import com.bicap.modules.auth.dto.*;
import com.bicap.modules.auth.service.AuthService;
import com.bicap.modules.user.dto.UserResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final ClientIpResolver clientIpResolver;

    @Value("${app.auth.refresh-cookie-name:bicap_refresh_token}")
    private String refreshCookieName;

    @Value("${app.auth.refresh-cookie-secure:false}")
    private boolean refreshCookieSecure;

    @Value("${app.auth.refresh-cookie-same-site:Lax}")
    private String refreshCookieSameSite;

    @Value("${app.auth.refresh-cookie-path:/api/v1/auth}")
    private String refreshCookiePath;

    public AuthController(AuthService authService, ClientIpResolver clientIpResolver) {
        this.authService = authService;
        this.clientIpResolver = clientIpResolver;
    }

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success("Đăng ký thành công", authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(request);
        setRefreshCookie(response, loginResponse.getRefreshToken(), loginResponse.getRefreshExpiresIn());
        return ApiResponse.success("Đăng nhập thành công", loginResponse);
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> me() {
        return ApiResponse.success("Lấy hồ sơ cá nhân thành công", authService.me());
    }

    @PostMapping("/change-password")
    public ApiResponse<String> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        return ApiResponse.success(authService.changePassword(request));
    }

    @PostMapping("/refresh")
    public ApiResponse<TokenRefreshResponse> refresh(@RequestBody(required = false) RefreshTokenRequest request,
                                                     HttpServletRequest httpRequest,
                                                     HttpServletResponse response) {
        RefreshTokenRequest refreshRequest = request != null ? request : new RefreshTokenRequest();
        if (refreshRequest.getRefreshToken() == null || refreshRequest.getRefreshToken().isBlank()) {
            refreshRequest.setRefreshToken(resolveRefreshCookie(httpRequest)
                    .orElseThrow(() -> new IllegalArgumentException("Refresh token is required")));
        }

        TokenRefreshResponse tokenResponse = authService.refreshToken(refreshRequest);
        setRefreshCookie(response, tokenResponse.getRefreshToken(), tokenResponse.getRefreshExpiresIn());
        return ApiResponse.success("Làm mới token thành công", tokenResponse);
    }

    @PostMapping("/logout")
    public ApiResponse<Map<String, String>> logout(HttpServletResponse response) {
        clearRefreshCookie(response);
        return ApiResponse.success("Đăng xuất thành công", authService.logout());
    }

    @PostMapping("/forgot-password")
    public ApiResponse<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest httpRequest) {
        return ApiResponse.success(authService.forgotPassword(request, clientIpResolver.resolve(httpRequest)));
    }

    @PostMapping("/reset-password")
    public ApiResponse<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ApiResponse.success(authService.resetPassword(request));
    }

    private Optional<String> resolveRefreshCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> refreshCookieName.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(value -> value != null && !value.isBlank())
                .findFirst();
    }

    private void setRefreshCookie(HttpServletResponse response, String refreshToken, Number maxAgeMillis) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }
        long maxAgeSeconds = maxAgeMillis == null ? 0 : Math.max(0, maxAgeMillis.longValue() / 1000);
        response.addHeader(HttpHeaders.SET_COOKIE, buildRefreshCookie(refreshToken, maxAgeSeconds));
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildRefreshCookie("", 0));
    }

    private String buildRefreshCookie(String value, long maxAgeSeconds) {
        return refreshCookieName + "=" + value
                + "; Max-Age=" + maxAgeSeconds
                + "; Path=" + refreshCookiePath
                + "; HttpOnly"
                + (refreshCookieSecure ? "; Secure" : "")
                + "; SameSite=" + refreshCookieSameSite;
    }
}
