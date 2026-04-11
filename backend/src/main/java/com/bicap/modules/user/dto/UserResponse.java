package com.bicap.modules.user.dto;
import com.bicap.modules.user.entity.User;
import com.bicap.core.enums.UserStatus;
import java.time.LocalDateTime;
import java.util.List;
public class UserResponse {
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    private UserStatus status;
    private List<String> roles;
    private String primaryRole;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    public UserResponse() {}
    public UserResponse(Long userId, String fullName, String email, String phone, String avatarUrl, UserStatus status, List<String> roles, String primaryRole, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.userId = userId; this.fullName = fullName; this.email = email; this.phone = phone; this.avatarUrl = avatarUrl; this.status = status; this.roles = roles; this.primaryRole = primaryRole; this.createdAt = createdAt; this.updatedAt = updatedAt;
    }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }
    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
    public String getPrimaryRole() { return primaryRole; }
    public void setPrimaryRole(String primaryRole) { this.primaryRole = primaryRole; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long userId; private String fullName; private String email; private String phone; private String avatarUrl; private UserStatus status; private List<String> roles; private String primaryRole; private LocalDateTime createdAt; private LocalDateTime updatedAt;
        public Builder userId(Long l) { this.userId = l; return this; }
        public Builder fullName(String s) { this.fullName = s; return this; }
        public Builder email(String s) { this.email = s; return this; }
        public Builder phone(String s) { this.phone = s; return this; }
        public Builder avatarUrl(String s) { this.avatarUrl = s; return this; }
        public Builder status(UserStatus s) { this.status = s; return this; }
        public Builder roles(List<String> l) { this.roles = l; return this; }
        public Builder primaryRole(String s) { this.primaryRole = s; return this; }
        public Builder createdAt(LocalDateTime t) { this.createdAt = t; return this; }
        public Builder updatedAt(LocalDateTime t) { this.updatedAt = t; return this; }
        public UserResponse build() { return new UserResponse(userId, fullName, email, phone, avatarUrl, status, roles, primaryRole, createdAt, updatedAt); }
    }
}
