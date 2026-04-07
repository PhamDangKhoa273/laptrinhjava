package com.bicap.backend.dto.auth;

import com.bicap.backend.dto.UserResponse;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String tokenType;
    private Long expiresIn;
    private String refreshToken;
    private Long refreshExpiresIn;
    private UserResponse user;

    // Manual Builder for Lombok fallback
    public static class LoginResponseBuilder {
        private String accessToken;
        private String tokenType;
        private Long expiresIn;
        private String refreshToken;
        private Long refreshExpiresIn;
        private UserResponse user;

        public LoginResponseBuilder accessToken(String accessToken) { this.accessToken = accessToken; return this; }
        public LoginResponseBuilder tokenType(String tokenType) { this.tokenType = tokenType; return this; }
        public LoginResponseBuilder expiresIn(Long expiresIn) { this.expiresIn = expiresIn; return this; }
        public LoginResponseBuilder refreshToken(String refreshToken) { this.refreshToken = refreshToken; return this; }
        public LoginResponseBuilder refreshExpiresIn(Long refreshExpiresIn) { this.refreshExpiresIn = refreshExpiresIn; return this; }
        public LoginResponseBuilder user(UserResponse user) { this.user = user; return this; }

        public LoginResponse build() {
            return new LoginResponse(accessToken, tokenType, expiresIn, refreshToken, refreshExpiresIn, user);
        }
    }

    public static LoginResponseBuilder builder() {
        return new LoginResponseBuilder();
    }
}
