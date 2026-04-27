package com.bicap.modules.user.service;

import com.bicap.core.enums.PermissionName;
import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.user.dto.AssignPermissionRequest;
import com.bicap.modules.user.dto.PermissionResponse;
import com.bicap.modules.user.dto.RolePermissionResponse;
import com.bicap.modules.user.entity.Permission;
import com.bicap.modules.user.entity.Role;
import com.bicap.modules.user.entity.RolePermission;
import com.bicap.modules.user.repository.PermissionRepository;
import com.bicap.modules.user.repository.RolePermissionRepository;
import com.bicap.modules.user.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PermissionService {
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;

    public PermissionService(PermissionRepository permissionRepository, RoleRepository roleRepository, RolePermissionRepository rolePermissionRepository) {
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
    }

    public List<PermissionResponse> getAllPermissions() {
        return permissionRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<RolePermissionResponse> getRolePermissions() {
        return rolePermissionRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public RolePermissionResponse assignPermission(AssignPermissionRequest request) {
        Role role = roleRepository.findByRoleName(request.getRoleName().name()).orElseThrow(() -> new BusinessException("Role kh?ng t?n t?i"));
        Permission permission = permissionRepository.findByPermissionName(request.getPermissionName().name()).orElseGet(() -> {
            Permission p = new Permission();
            p.setPermissionName(request.getPermissionName().name());
            p.setDescription(request.getPermissionName().name());
            return permissionRepository.save(p);
        });
        if (rolePermissionRepository.existsByRoleAndPermission(role, permission)) {
            throw new BusinessException("Role ?? c? permission n?y");
        }
        RolePermission rp = new RolePermission();
        rp.setRole(role);
        rp.setPermission(permission);
        return toResponse(rolePermissionRepository.save(rp));
    }

    public void seedDefaults() {
        grant(RoleName.ADMIN, PermissionName.ALL_ACCESS);
        grant(RoleName.ADMIN, PermissionName.USERS_MANAGE);
        grant(RoleName.ADMIN, PermissionName.FARMS_REVIEW);
        grant(RoleName.ADMIN, PermissionName.BLOCKCHAIN_GOVERNANCE);
        grant(RoleName.ADMIN, PermissionName.RETAILERS_MANAGE);
        grant(RoleName.ADMIN, PermissionName.SHIPMENTS_MANAGE);
        grant(RoleName.ADMIN, PermissionName.NOTIFICATIONS_MANAGE);
        grant(RoleName.GUEST, PermissionName.NOTIFICATIONS_MANAGE);
    }

    private void grant(RoleName roleName, PermissionName permissionName) {
        Role role = roleRepository.findByRoleName(roleName.name()).orElseThrow(() -> new BusinessException("Role kh?ng t?n t?i"));
        Permission permission = permissionRepository.findByPermissionName(permissionName.name()).orElseGet(() -> {
            Permission p = new Permission();
            p.setPermissionName(permissionName.name());
            p.setDescription(permissionName.name());
            return permissionRepository.save(p);
        });
        if (!rolePermissionRepository.existsByRoleAndPermission(role, permission)) {
            RolePermission rp = new RolePermission();
            rp.setRole(role);
            rp.setPermission(permission);
            rolePermissionRepository.save(rp);
        }
    }

    private PermissionResponse toResponse(Permission permission) {
        PermissionResponse r = new PermissionResponse();
        r.setPermissionId(permission.getPermissionId());
        r.setPermissionName(permission.getPermissionName());
        r.setDescription(permission.getDescription());
        return r;
    }

    private RolePermissionResponse toResponse(RolePermission rp) {
        RolePermissionResponse r = new RolePermissionResponse();
        r.setRolePermissionId(rp.getRolePermissionId());
        r.setRoleName(rp.getRole() != null ? rp.getRole().getRoleName() : null);
        r.setPermissionName(rp.getPermission() != null ? rp.getPermission().getPermissionName() : null);
        return r;
    }
}
