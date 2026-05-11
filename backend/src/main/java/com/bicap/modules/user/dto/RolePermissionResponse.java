package com.bicap.modules.user.dto;

public class RolePermissionResponse {
    private Long rolePermissionId;
    private String roleName;
    private String permissionName;

    public Long getRolePermissionId() { return rolePermissionId; }
    public void setRolePermissionId(Long rolePermissionId) { this.rolePermissionId = rolePermissionId; }
    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
    public String getPermissionName() { return permissionName; }
    public void setPermissionName(String permissionName) { this.permissionName = permissionName; }
}
