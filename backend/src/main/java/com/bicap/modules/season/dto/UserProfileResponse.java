package com.bicap.modules.season.dto;

import com.bicap.modules.user.dto.UserResponse;

import java.util.List;

public class UserProfileResponse {
    private UserResponse user;
    private List<String> roles;

    public UserResponse getUser() { return user; }
    public void setUser(UserResponse user) { this.user = user; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}
