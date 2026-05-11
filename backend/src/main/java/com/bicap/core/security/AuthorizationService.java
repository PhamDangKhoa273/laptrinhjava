package com.bicap.core.security;

import com.bicap.core.enums.PermissionName;
import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.user.entity.Permission;
import com.bicap.modules.user.entity.Role;
import com.bicap.modules.user.entity.RolePermission;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.PermissionRepository;
import com.bicap.modules.user.repository.RolePermissionRepository;
import com.bicap.modules.user.repository.RoleRepository;
import com.bicap.modules.user.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class AuthorizationService {
    private final UserService userService;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    public AuthorizationService(UserService userService, RoleRepository roleRepository, PermissionRepository permissionRepository, RolePermissionRepository rolePermissionRepository) {
        this.userService = userService;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.rolePermissionRepository = rolePermissionRepository;
    }

    public void requirePermission(PermissionName permissionName) {
        User user = userService.getUserEntityById(SecurityUtils.getCurrentUserId());
        if (userService.hasRole(user, RoleName.ADMIN) && hasPermission(user, PermissionName.ALL_ACCESS)) return;
        if (!hasPermission(user, permissionName)) {
            throw new BusinessException("B?n kh?ng c? quy?n th?c hi?n thao t?c n?y");
        }
    }

    public boolean hasPermission(User user, PermissionName permissionName) {
        return user.getRoles().stream().anyMatch(role -> hasPermission(role, permissionName));
    }

    public boolean hasPermission(Role role, PermissionName permissionName) {
        Permission permission = permissionRepository.findByPermissionName(permissionName.name()).orElse(null);
        if (permission == null) return false;
        return rolePermissionRepository.existsByRoleAndPermission(role, permission);
    }

    public void grant(RoleName roleName, PermissionName permissionName) {
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
}
