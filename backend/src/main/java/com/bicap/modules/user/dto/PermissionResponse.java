package com.bicap.modules.user.dto;

public class PermissionResponse {
    private Long permissionId;
    private String permissionName;
    private String description;

    public Long getPermissionId() { return permissionId; }
    public void setPermissionId(Long permissionId) { this.permissionId = permissionId; }
    public String getPermissionName() { return permissionName; }
    public void setPermissionName(String permissionName) { this.permissionName = permissionName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
