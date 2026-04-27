package com.bicap.modules.auth.controller;

import com.bicap.core.exception.GlobalExceptionHandler;
import com.bicap.core.security.ClientIpResolver;
import com.bicap.modules.auth.dto.LoginResponse;
import com.bicap.modules.auth.dto.TokenRefreshResponse;
import com.bicap.modules.auth.service.AuthService;
import com.bicap.modules.user.dto.UserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTests {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @Mock
    private ClientIpResolver clientIpResolver;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new AuthController(authService, clientIpResolver))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void login_shouldReturnTokensAndUser() throws Exception {
        UserResponse userResponse = UserResponse.builder()
                .userId(1L)
                .fullName("Test User")
                .email("test@example.com")
                .roles(List.of("GUEST"))
                .primaryRole("GUEST")
                .build();

        LoginResponse loginResponse = LoginResponse.builder()
                .accessToken("access-token")
                .tokenType("Bearer")
                .expiresIn(3600000L)
                .refreshToken("refresh-token")
                .refreshExpiresIn(86400000L)
                .user(userResponse)
                .build();

        when(authService.login(any())).thenReturn(loginResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "test@example.com",
                                  "password": "secret123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("access-token"))
                .andExpect(jsonPath("$.data.refreshToken").value("refresh-token"))
                .andExpect(jsonPath("$.data.user.email").value("test@example.com"));
    }

    @Test
    void refresh_shouldReturnNewTokenPair() throws Exception {
        TokenRefreshResponse refreshResponse = TokenRefreshResponse.builder()
                .accessToken("new-access-token")
                .tokenType("Bearer")
                .expiresIn(3600000L)
                .refreshToken("new-refresh-token")
                .refreshExpiresIn(86400000L)
                .build();

        when(authService.refreshToken(any())).thenReturn(refreshResponse);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "refreshToken": "refresh-token"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("new-access-token"))
                .andExpect(jsonPath("$.data.refreshToken").value("new-refresh-token"));
    }

    @Test
    void me_shouldReturnCurrentUser() throws Exception {
        UserResponse userResponse = UserResponse.builder()
                .userId(1L)
                .fullName("Authenticated User")
                .email("auth@example.com")
                .roles(List.of("GUEST"))
                .primaryRole("GUEST")
                .build();

        when(authService.me()).thenReturn(userResponse);

        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("auth@example.com"));
    }

    @Test
    void logout_shouldSucceed() throws Exception {
        when(authService.logout()).thenReturn(Map.of(
                "logoutMode", "CLIENT_SIDE",
                "message", "Xóa access token và refresh token ở phía client để hoàn tất đăng xuất"
        ));

        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.logoutMode").value("CLIENT_SIDE"));
    }
}
