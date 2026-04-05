package com.bicap.backend.dto.auth;

import com.bicap.backend.dto.UserResponse;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private String accessToken;
    private String tokenType;
    private Long expiresIn;
    private String refreshToken;
    private Long refreshExpiresIn;
    private UserResponse user;
}
