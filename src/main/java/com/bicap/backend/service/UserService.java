package com.bicap.backend.service;

import com.bicap.backend.dto.UpdateUserStatusRequest;
import com.bicap.backend.dto.UserResponse;
import com.bicap.backend.dto.request.AssignRoleRequest;
import com.bicap.backend.dto.request.CreateUserRequest;
import com.bicap.backend.dto.request.UpdateProfileRequest;
import com.bicap.backend.dto.response.UserProfileResponse;
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

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        User savedUser = createUser(
                request.getFullName(),
                request.getEmail(),
                request.getPassword(),
                request.getPhone(),
                request.getAvatarUrl(),
                RoleName.GUEST
        );

        return toResponse(savedUser);
    }

    @Transactional
    public User createUser(String fullName,
                           String email,
                           String rawPassword,
                           String phone,
                           String avatarUrl,
                           RoleName defaultRole) {
        String normalizedEmail = normalizeEmail(email);
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BusinessException("Email đã tồn tại");
        }

        User user = new User();
        user.setFullName(normalizeText(fullName));
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setPhone(normalizeText(phone));
        user.setAvatarUrl(normalizeText(avatarUrl));
        user.setStatus(UserStatus.ACTIVE.name());

        User savedUser = userRepository.save(user);
        assignDefaultRole(savedUser, defaultRole);
        return savedUser;
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

        if (request.getEmail() != null) {
            String normalizedEmail = normalizeEmail(request.getEmail());
            if (!normalizedEmail.equalsIgnoreCase(user.getEmail())
                    && userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
                throw new BusinessException("Email đã tồn tại");
            }
            user.setEmail(normalizedEmail);
        }

        if (request.getFullName() != null) {
            user.setFullName(normalizeText(request.getFullName()));
        }
        if (request.getPhone() != null) {
            user.setPhone(normalizeText(request.getPhone()));
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(normalizeText(request.getAvatarUrl()));
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

    public UserProfileResponse getProfile(Long userId) {
        User user = getUserEntityById(userId);
        List<String> roles = userRoleRepository.findByUser(user).stream()
                .map(userRole -> userRole.getRole().getRoleName())
                .toList();

        return UserProfileResponse.builder()
                .user(toResponse(user))
                .roles(roles)
                .build();
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

    private void assignDefaultRole(User user, RoleName roleName) {
        Role role = roleRepository.findByRoleName(roleName.name())
                .orElseThrow(() -> new BusinessException("Không tìm thấy role " + roleName.name()));

        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(role);
        userRoleRepository.save(userRole);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
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
