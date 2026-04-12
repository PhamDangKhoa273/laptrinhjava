package com.bicap.modules.user.dto;

import com.bicap.core.enums.UserStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateUserStatusRequest {

    @NotNull(message = "Status không được để trống")
    private UserStatus status;

    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }
}
