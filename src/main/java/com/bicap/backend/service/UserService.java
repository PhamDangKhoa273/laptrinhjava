package com.bicap.backend.service;

import com.bicap.backend.dto.request.AssignRoleRequest;
import com.bicap.backend.dto.request.CreateUserRequest;
import com.bicap.backend.dto.request.UpdateProfileRequest;
import com.bicap.backend.entity.Role;
import com.bicap.backend.entity.User;
import com.bicap.backend.entity.UserRole;
import com.bicap.backend.enums.RoleName;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.RoleRepository;
import com.bicap.backend.repository.UserRepository;
import com.bicap.backend.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public User createUser(CreateUserRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new BusinessException("Email đã tồn tại");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setStatus("ACTIVE");

        User savedUser = userRepository.save(user);

        Role guestRole = roleRepository.findByRoleName("GUEST")
                .orElseThrow(() -> new BusinessException("Không tìm thấy role GUEST"));

        UserRole userRole = new UserRole();
        userRole.setUser(savedUser);
        userRole.setRole(guestRole);
        userRoleRepository.save(userRole);

        return savedUser;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user"));
    }

    public User updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getUserById(userId);

        if (request.getEmail() != null
                && !request.getEmail().equalsIgnoreCase(user.getEmail())
                && userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new BusinessException("Email đã tồn tại");
        }

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail().trim().toLowerCase());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        return userRepository.save(user);
    }

    public User changeStatus(Long userId, String status) {
        User user = getUserById(userId);
        user.setStatus(status);
        return userRepository.save(user);
    }

    public String assignRole(Long userId, AssignRoleRequest request) {
        User user = getUserById(userId);

        Role role = roleRepository.findByRoleName(request.getRoleName().name())
                .orElseThrow(() -> new BusinessException("Role không tồn tại"));

        if (userRoleRepository.existsByUserAndRole(user, role)) {
            throw new BusinessException("User đã có role này");
        }

        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(role);
        userRoleRepository.save(userRole);

        return "Gán role thành công";
    }

    public Map<String, Object> getProfile(Long userId) {
        User user = getUserById(userId);
        List<UserRole> roles = userRoleRepository.findByUser(user);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("userId", user.getUserId());
        data.put("fullName", user.getFullName());
        data.put("email", user.getEmail());
        data.put("phone", user.getPhone());
        data.put("avatarUrl", user.getAvatarUrl());
        data.put("status", user.getStatus());
        data.put("roles", roles.stream().map(r -> r.getRole().getRoleName()).toList());

        return data;
    }

    public boolean hasRole(User user, RoleName roleName) {
        return userRoleRepository.findByUser(user).stream()
                .anyMatch(ur -> ur.getRole().getRoleName().equalsIgnoreCase(roleName.name()));
    }
}