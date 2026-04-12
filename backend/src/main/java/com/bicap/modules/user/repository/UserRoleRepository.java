package com.bicap.modules.user.repository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.entity.UserRole;
import com.bicap.modules.user.entity.Role;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    boolean existsByUserAndRole(User user, Role role);
    List<UserRole> findByUser(User user);
}
