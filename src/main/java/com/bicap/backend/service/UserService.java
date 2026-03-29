package com.bicap.backend.service;

import com.bicap.backend.dto.UpdateUserStatusRequest;
import com.bicap.backend.dto.UserResponse;
import com.bicap.backend.dto.request.AssignRoleRequest;
import com.bicap.backend.dto.request.CreateUserRequest;
import com.bicap.backend.dto.request.UpdateProfileRequest;
import com.bicap.backend.entity.Role;
import com.bicap.backend.entity.User;
import com.bicap.backend.entity.UserRole;
import com.bicap.backend.enums.RoleName;
import com.bicap.backend.enums.UserStatus;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.RoleRepository;
import com.bicap.backend.repository.UserRepository;
import com.bicap.backend.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail().trim())) {
            throw new BusinessException("Email đã tồn tại");
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setStatus(UserStatus.ACTIVE.name());

        User savedUser = userRepository.save(user);

        Role guestRole = roleRepository.findByRoleName(RoleName.GUEST.name())
                .orElseThrow(() -> new BusinessException("Không tìm thấy role GUEST"));

        UserRole userRole = new UserRole();
        userRole.setUser(savedUser);
        userRole.setRole(guestRole);
        userRoleRepository.save(userRole);

        return toResponse(savedUser);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse getUserById(Long userId) {
        return toResponse(getUserEntityById(userId));
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getUserEntityById(userId);

        if (request.getEmail() != null
                && !request.getEmail().equalsIgnoreCase(user.getEmail())
                && userRepository.existsByEmailIgnoreCase(request.getEmail().trim())) {
            throw new BusinessException("Email đã tồn tại");
        }

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail().trim().toLowerCase());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse changeStatus(Long userId, UpdateUserStatusRequest request) {
        User user = getUserEntityById(userId);
        user.setStatus(request.getStatus().name());
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public String assignRole(Long userId, AssignRoleRequest request) {
        User user = getUserEntityById(userId);

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
        User user = getUserEntityById(userId);
        List<UserRole> roles = userRoleRepository.findByUser(user);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("user", toResponse(user));
        data.put("roles", roles.stream().map(r -> r.getRole().getRoleName()).toList());

        return data;
    }

    public boolean hasRole(User user, RoleName roleName) {
        return userRoleRepository.findByUser(user).stream()
                .anyMatch(ur -> ur.getRole().getRoleName().equalsIgnoreCase(roleName.name()));
    }

    public User getUserEntityById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user"));
    }

    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    private UserResponse toResponse(User user) {
        UserStatus status;
        try {
            status = UserStatus.valueOf(user.getStatus());
        } catch (IllegalArgumentException ex) {
            status = UserStatus.INACTIVE;
        }

        return UserResponse.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .status(status)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
