package com.bicap.backend.dto.request;

import com.bicap.backend.enums.RoleName;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignRoleRequest {

    @NotNull(message = "roleName lÃ  báº¯t buá»™c")
    private RoleName roleName;
}
