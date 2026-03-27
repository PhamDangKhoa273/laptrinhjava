package com.bicap.backend.dto;

import com.bicap.backend.enums.RoleName;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignRoleRequest {

    @NotNull(message = "Role name không được để trống")
    private RoleName roleName;
}