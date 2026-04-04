package com.bicap.backend.dto;

import com.bicap.backend.enums.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserStatusRequest {

    @NotNull(message = "Status không được để trống")
    private UserStatus status;
}