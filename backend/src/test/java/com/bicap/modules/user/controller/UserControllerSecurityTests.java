package com.bicap.modules.user.controller;

import com.bicap.core.exception.GlobalExceptionHandler;
import com.bicap.modules.user.dto.UserResponse;
import com.bicap.modules.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;


import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class UserControllerSecurityTests {

    private MockMvc mockMvc;

    @Mock
    private UserService userService;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new UserController(userService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getMyProfileAlias_shouldReturnCurrentUser() throws Exception {
        UserResponse userResponse = UserResponse.builder()
                .userId(1L)
                .fullName("Normal User")
                .email("user@example.com")
                .roles(java.util.List.of("GUEST"))
                .primaryRole("GUEST")
                .build();

        when(userService.getCurrentUserProfile()).thenReturn(userResponse);

        mockMvc.perform(get("/api/v1/users/me/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("user@example.com"));
    }

    @Test
    void getUserById_shouldReturnUser() throws Exception {
        UserResponse userResponse = UserResponse.builder()
                .userId(99L)
                .fullName("Managed User")
                .email("managed@example.com")
                .roles(java.util.List.of("GUEST"))
                .primaryRole("GUEST")
                .build();

        when(userService.getUserById(99L)).thenReturn(userResponse);

        mockMvc.perform(get("/api/v1/users/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("managed@example.com"));
    }

    @Test
    void updateMyProfile_shouldAllowValidPayload() throws Exception {
        UserResponse userResponse = UserResponse.builder()
                .userId(1L)
                .fullName("Updated User")
                .email("user@example.com")
                .phone("0901234567")
                .roles(java.util.List.of("GUEST"))
                .primaryRole("GUEST")
                .build();

        when(userService.updateCurrentUserProfile(any())).thenReturn(userResponse);

        mockMvc.perform(put("/api/v1/users/me/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Updated User",
                                  "phone": "0901234567"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("Updated User"));
    }

    @Test
    void updateMyProfile_shouldRejectInvalidPayload() throws Exception {
        mockMvc.perform(put("/api/v1/users/me/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "A",
                                  "phone": "123"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }
}
