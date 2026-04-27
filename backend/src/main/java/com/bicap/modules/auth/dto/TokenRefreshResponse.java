package com.bicap.modules.auth.dto;

public class TokenRefreshResponse {
    private String accessToken;
    private String tokenType;
    private long expiresIn;
    private String refreshToken;
    private long refreshExpiresIn;

    public TokenRefreshResponse() {}
    public TokenRefreshResponse(String accessToken, String tokenType, long expiresIn, String refreshToken, long refreshExpiresIn) {
        this.accessToken = accessToken; this.tokenType = tokenType; this.expiresIn = expiresIn; this.refreshToken = refreshToken; this.refreshExpiresIn = refreshExpiresIn;
    }
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public long getRefreshExpiresIn() { return refreshExpiresIn; }
    public void setRefreshExpiresIn(long refreshExpiresIn) { this.refreshExpiresIn = refreshExpiresIn; }
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private String accessToken; private String tokenType; private long expiresIn; private String refreshToken; private long refreshExpiresIn;
        public Builder accessToken(String s) { this.accessToken = s; return this; }
        public Builder tokenType(String s) { this.tokenType = s; return this; }
        public Builder expiresIn(long l) { this.expiresIn = l; return this; }
        public Builder refreshToken(String s) { this.refreshToken = s; return this; }
        public Builder refreshExpiresIn(long l) { this.refreshExpiresIn = l; return this; }
        public TokenRefreshResponse build() { return new TokenRefreshResponse(accessToken, tokenType, expiresIn, refreshToken, refreshExpiresIn); }
    }
}
