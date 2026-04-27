package com.bicap.modules.user.dto;
import com.bicap.core.enums.RoleName;
import jakarta.validation.constraints.NotNull;

public class AssignRoleRequest {

    @NotNull(message = "roleName lÃ  báº¯t buá»™c")
    private RoleName roleName;

    public RoleName getRoleName() { return roleName; }
    public void setRoleName(RoleName roleName) { this.roleName = roleName; }
}
