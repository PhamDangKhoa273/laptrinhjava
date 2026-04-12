package com.bicap.backend.dto;

import com.bicap.backend.enums.UserStatus;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

    // Manual Getter for Lombok fallback
    public Long getUserId() { return userId; }
    public String getFullName() { return fullName; }
    
    // Manual Builder for Lombok fallback
    public static class UserResponseBuilder {
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

        public UserResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public UserResponseBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public UserResponseBuilder email(String email) { this.email = email; return this; }
        public UserResponseBuilder phone(String phone) { this.phone = phone; return this; }
        public UserResponseBuilder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }
        public UserResponseBuilder status(UserStatus status) { this.status = status; return this; }
        public UserResponseBuilder roles(List<String> roles) { this.roles = roles; return this; }
        public UserResponseBuilder primaryRole(String primaryRole) { this.primaryRole = primaryRole; return this; }
        public UserResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public UserResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public UserResponse build() {
            return new UserResponse(userId, fullName, email, phone, avatarUrl, status, roles, primaryRole, createdAt, updatedAt);
        }
    }

    public static UserResponseBuilder builder() {
        return new UserResponseBuilder();
    }
}
