package com.bicap.modules.user.repository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.entity.Role;

import com.bicap.modules.user.entity.User;

import com.bicap.modules.user.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByRoleName(String roleName);
}
