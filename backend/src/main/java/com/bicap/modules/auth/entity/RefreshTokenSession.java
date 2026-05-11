package com.bicap.modules.auth.entity;

import com.bicap.modules.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_token_sessions", indexes = {
        @Index(name = "idx_refresh_token_sessions_jti", columnList = "jti", unique = true),
        @Index(name = "idx_refresh_token_sessions_user_id", columnList = "user_id")
})
public class RefreshTokenSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String jti;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime issuedAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private LocalDateTime revokedAt;

    @Column(length = 512)
    private String deviceInfo;

    @Column(length = 64)
    private String refreshTokenHash;

    @Column(length = 128)
    private String rotationReason;

    @Column(length = 128)
    private String replacedByJti;

    @Column(nullable = false)
    private boolean active = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getJti() { return jti; }
    public void setJti(String jti) { this.jti = jti; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public LocalDateTime getRevokedAt() { return revokedAt; }
    public void setRevokedAt(LocalDateTime revokedAt) { this.revokedAt = revokedAt; }
    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }
    public String getRefreshTokenHash() { return refreshTokenHash; }
    public void setRefreshTokenHash(String refreshTokenHash) { this.refreshTokenHash = refreshTokenHash; }
    public String getRotationReason() { return rotationReason; }
    public void setRotationReason(String rotationReason) { this.rotationReason = rotationReason; }
    public String getReplacedByJti() { return replacedByJti; }
    public void setReplacedByJti(String replacedByJti) { this.replacedByJti = replacedByJti; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public void revoke(String reason) {
        this.active = false;
        this.revokedAt = LocalDateTime.now();
        this.rotationReason = reason;
    }
}
