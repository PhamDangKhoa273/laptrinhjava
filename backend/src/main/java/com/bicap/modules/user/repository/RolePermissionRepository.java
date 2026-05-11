package com.bicap.modules.user.repository;

import com.bicap.modules.user.entity.Permission;
import com.bicap.modules.user.entity.Role;
import com.bicap.modules.user.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
    List<RolePermission> findByRole(Role role);
    boolean existsByRoleAndPermission(Role role, Permission permission);
}
