package com.bicap.modules.auth.dto;
import com.bicap.modules.user.dto.UserResponse;
public class LoginResponse {
    private String accessToken;
    private String tokenType;
    private Long expiresIn;
    private String refreshToken;
    private Long refreshExpiresIn;
    private UserResponse user;
    public LoginResponse() {}
    public LoginResponse(String accessToken, String tokenType, Long expiresIn, String refreshToken, Long refreshExpiresIn, UserResponse user) {
        this.accessToken = accessToken; this.tokenType = tokenType; this.expiresIn = expiresIn; this.refreshToken = refreshToken; this.refreshExpiresIn = refreshExpiresIn; this.user = user;
    }
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public Long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(Long expiresIn) { this.expiresIn = expiresIn; }
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public Long getRefreshExpiresIn() { return refreshExpiresIn; }
    public void setRefreshExpiresIn(Long refreshExpiresIn) { this.refreshExpiresIn = refreshExpiresIn; }
    public UserResponse getUser() { return user; }
    public void setUser(UserResponse user) { this.user = user; }
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private String accessToken; private String tokenType; private Long expiresIn; private String refreshToken; private Long refreshExpiresIn; private UserResponse user;
        public Builder accessToken(String s) { this.accessToken = s; return this; }
        public Builder tokenType(String s) { this.tokenType = s; return this; }
        public Builder expiresIn(Long l) { this.expiresIn = l; return this; }
        public Builder refreshToken(String s) { this.refreshToken = s; return this; }
        public Builder refreshExpiresIn(Long l) { this.refreshExpiresIn = l; return this; }
        public Builder user(UserResponse u) { this.user = u; return this; }
        public LoginResponse build() { return new LoginResponse(accessToken, tokenType, expiresIn, refreshToken, refreshExpiresIn, user); }
    }
}
