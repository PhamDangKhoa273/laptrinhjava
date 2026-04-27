package com.bicap.modules.auth.dto;

public class RefreshTokenRequest {
    private String refreshToken;

    private String deviceInfo;

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }
}
