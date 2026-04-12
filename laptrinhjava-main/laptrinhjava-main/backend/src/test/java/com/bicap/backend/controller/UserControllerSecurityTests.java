package com.bicap.backend.controller;

import com.bicap.backend.dto.UserResponse;
import com.bicap.backend.security.CustomUserDetailsService;
import com.bicap.backend.security.JwtTokenProvider;
import com.bicap.backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = UserController.class)
@Import(com.bicap.backend.config.SecurityConfig.class)
class UserControllerSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;
    @MockBean
    private JwtTokenProvider jwtTokenProvider;
    @MockBean
    private CustomUserDetailsService customUserDetailsService;
    @MockBean
    private AuthenticationManager authenticationManager;

    @Test
    void getMyProfileAlias_shouldRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/users/me/profile"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void getMyProfileAlias_shouldAllowAuthenticatedNonAdminUser() throws Exception {
        UserResponse userResponse = UserResponse.builder()
                .userId(1L)
                .fullName("Normal User")
                .email("user@example.com")
                .roles(List.of("GUEST"))
                .primaryRole("GUEST")
                .build();

        when(userService.getCurrentUserProfile()).thenReturn(userResponse);

        mockMvc.perform(get("/api/users/me/profile")
                        .with(user("user@example.com").roles("GUEST")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("user@example.com"));
    }

    @Test
    void getUserById_shouldRejectAuthenticatedNonAdminUser() throws Exception {
        mockMvc.perform(get("/api/users/99")
                        .with(user("user@example.com").roles("GUEST")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void getUserById_shouldAllowAdmin() throws Exception {
        UserResponse userResponse = UserResponse.builder()
                .userId(99L)
                .fullName("Managed User")
                .email("managed@example.com")
                .roles(List.of("GUEST"))
                .primaryRole("GUEST")
                .build();

        when(userService.getUserById(99L)).thenReturn(userResponse);

        mockMvc.perform(get("/api/users/99")
                        .with(user("admin@example.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("managed@example.com"));
    }

    @Test
    void updateMyProfile_shouldAllowAuthenticatedUser() throws Exception {
        UserResponse userResponse = UserResponse.builder()
                .userId(1L)
                .fullName("Updated User")
                .email("user@example.com")
                .phone("0901234567")
                .roles(List.of("GUEST"))
                .primaryRole("GUEST")
                .build();

        when(userService.updateCurrentUserProfile(any())).thenReturn(userResponse);

        mockMvc.perform(put("/api/users/me/profile")
                        .with(user("user@example.com").roles("GUEST"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  \"fullName\": \"Updated User\",
                                  \"phone\": \"0901234567\"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("Updated User"));
    }
}
