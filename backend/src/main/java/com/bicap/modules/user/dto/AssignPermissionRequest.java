package com.bicap.modules.user.dto;

import com.bicap.core.enums.PermissionName;
import com.bicap.core.enums.RoleName;

public class AssignPermissionRequest {
    private RoleName roleName;
    private PermissionName permissionName;
    public RoleName getRoleName() { return roleName; }
    public void setRoleName(RoleName roleName) { this.roleName = roleName; }
    public PermissionName getPermissionName() { return permissionName; }
    public void setPermissionName(PermissionName permissionName) { this.permissionName = permissionName; }
}
