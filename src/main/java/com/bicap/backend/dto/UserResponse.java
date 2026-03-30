package com.bicap.backend.dto;

import com.bicap.backend.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
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
}