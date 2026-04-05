package com.bicap.backend.dto.response;

import com.bicap.backend.dto.UserResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class UserProfileResponse {
    private UserResponse user;
    private List<String> roles;
}

