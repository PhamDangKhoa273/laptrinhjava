package com.bicap.modules.user.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.user.dto.AssignPermissionRequest;
import com.bicap.modules.user.dto.PermissionResponse;
import com.bicap.modules.user.dto.RolePermissionResponse;
import com.bicap.modules.user.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/permissions")
@RequiredArgsConstructor
public class PermissionController {
    private final PermissionService permissionService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<PermissionResponse>> all() {
        return ApiResponse.success(permissionService.getAllPermissions());
    }

    @GetMapping("/role-matrix")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<RolePermissionResponse>> matrix() {
        return ApiResponse.success(permissionService.getRolePermissions());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<RolePermissionResponse> assign(@RequestBody AssignPermissionRequest request) {
        return ApiResponse.success(permissionService.assignPermission(request));
    }

    @PostMapping("/seed")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> seed() {
        permissionService.seedDefaults();
        return ApiResponse.success("Seeded");
    }
}
