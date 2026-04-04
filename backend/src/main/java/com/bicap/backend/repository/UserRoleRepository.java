package com.bicap.backend.repository;

import com.bicap.backend.entity.Role;
import com.bicap.backend.entity.User;
import com.bicap.backend.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    boolean existsByUserAndRole(User user, Role role);
    List<UserRole> findByUser(User user);
}