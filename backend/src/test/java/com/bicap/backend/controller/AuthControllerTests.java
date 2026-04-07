package com.bicap.backend.controller;

import com.bicap.backend.dto.UserResponse;
import com.bicap.backend.dto.auth.LoginResponse;
import com.bicap.backend.dto.auth.TokenRefreshResponse;
import com.bicap.backend.security.CustomUserDetailsService;
import com.bicap.backend.security.JwtTokenProvider;
import com.bicap.backend.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@Import(com.bicap.backend.config.SecurityConfig.class)
class AuthControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;
    @MockBean
    private JwtTokenProvider jwtTokenProvider;
    @MockBean
    private CustomUserDetailsService customUserDetailsService;
    @MockBean
    private AuthenticationManager authenticationManager;

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

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  \"email\": \"test@example.com\",
                                  \"password\": \"secret123\"
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

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  \"refreshToken\": \"refresh-token\"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("new-access-token"))
                .andExpect(jsonPath("$.data.refreshToken").value("new-refresh-token"));
    }

    @Test
    void me_shouldRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void me_shouldReturnCurrentUserWhenAuthenticated() throws Exception {
        UserResponse userResponse = UserResponse.builder()
                .userId(1L)
                .fullName("Authenticated User")
                .email("auth@example.com")
                .roles(List.of("GUEST"))
                .primaryRole("GUEST")
                .build();

        when(authService.me()).thenReturn(userResponse);

        mockMvc.perform(get("/api/auth/me")
                        .with(user("auth@example.com").roles("GUEST")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("auth@example.com"));
    }

    @Test
    void logout_shouldRequireAuthentication() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void logout_shouldSucceedForAuthenticatedUser() throws Exception {
        when(authService.logout()).thenReturn(Map.of(
                "logoutMode", "CLIENT_SIDE",
                "message", "Xóa access token và refresh token ở phía client để hoàn tất đăng xuất"
        ));

        mockMvc.perform(post("/api/auth/logout")
                        .with(user("auth@example.com").roles("GUEST")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.logoutMode").value("CLIENT_SIDE"));
    }
}
