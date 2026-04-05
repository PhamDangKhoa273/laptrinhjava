package com.bicap.backend.dto.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TokenRefreshResponse {
    private String accessToken;
    private String tokenType;
    private long expiresIn;
    private String refreshToken;
    private long refreshExpiresIn;
}
