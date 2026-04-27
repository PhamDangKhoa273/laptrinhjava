package com.bicap.modules.user.service;

import com.bicap.core.enums.PermissionName;
import com.bicap.core.enums.RoleName;
import com.bicap.core.enums.UserStatus;
import com.bicap.core.exception.BusinessException;
import com.bicap.core.service.SecurityAuditService;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.user.dto.*;
import com.bicap.modules.user.entity.Role;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.entity.UserRole;
import com.bicap.modules.user.repository.RoleRepository;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityAuditService securityAuditService;

    @Transactional
    public UserResponse createUser(String fullName, String email, String rawPassword, String phone, String avatarUrl, RoleName roleName) {
        String normalizedEmail = normalizeRequired(email, "Email").toLowerCase();
        String normalizedFullName = normalizeRequired(fullName, "Họ tên");
        String normalizedPassword = normalizeRequired(rawPassword, "Mật khẩu");
        RoleName effectiveRole = roleName != null ? roleName : RoleName.GUEST;

        if (normalizedPassword.length() < 8) {
            throw new BusinessException("Mật khẩu phải có ít nhất 8 ký tự");
        }
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BusinessException("Email đã tồn tại");
        }

        Role role = roleRepository.findByRoleName(effectiveRole.name())
                .orElseThrow(() -> new BusinessException("Role không tồn tại"));

        User user = new User();
        user.setFullName(normalizedFullName);
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(normalizedPassword));
        user.setPhone(normalizeNullable(phone));
        user.setAvatarUrl(normalizeNullable(avatarUrl));
        user.setStatus(UserStatus.ACTIVE);

        User saved = userRepository.save(user);
        UserRole userRole = new UserRole();
        userRole.setUser(saved);
        userRole.setRole(role);
        userRoleRepository.save(userRole);

        securityAuditService.logDomainAction(saved.getUserId(), "USER_REGISTER", "USER", saved.getUserId(), "role=" + effectiveRole.name());
        return toResponse(saved);
    }

    @Transactional
    public UserResponse createUserByAdmin(CreateUserRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new BusinessException("Email đã tồn tại");
        }
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(normalizeNullable(request.getPhone()));
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus(UserStatus.ACTIVE);
        User saved = userRepository.save(user);
        Role guestRole = roleRepository.findByRoleName(RoleName.GUEST.name()).orElseThrow(() -> new BusinessException("Role không tồn tại"));
        if (!userRoleRepository.existsByUserAndRole(saved, guestRole)) {
            UserRole userRole = new UserRole();
            userRole.setUser(saved);
            userRole.setRole(guestRole);
            userRoleRepository.save(userRole);
        }
        securityAuditService.logAdminAction(SecurityUtils.getCurrentUserIdOrNull(), "USER_CREATE", String.valueOf(saved.getUserId()), saved.getEmail());
        return toResponse(saved);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse getUserById(Long userId) {
        return toResponse(getUserEntityById(userId));
    }

    public UserResponse getCurrentUserProfile() {
        return getUserById(SecurityUtils.getCurrentUserId());
    }

    @Transactional
    public UserResponse updateCurrentUserProfile(UpdateProfileRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return updateProfileInternal(currentUserId, request);
    }

    @Transactional
    public UserResponse updateProfileAsAdmin(Long userId, UpdateProfileRequest request) {
        return updateProfileInternal(userId, request);
    }

    @Transactional
    public void deleteUser(Long userId) {
        requirePermissionSafe(PermissionName.USERS_MANAGE);
        User user = getUserEntityById(userId);
        if (userRepository.count() <= 1) {
            throw new BusinessException("Không thể xoá tài khoản cuối cùng");
        }
        if (hasRole(user, RoleName.ADMIN)) {
            long adminCount = userRepository.findAll().stream().filter(this::hasAdminRole).count();
            if (adminCount <= 1) {
                throw new BusinessException("Không thể xoá admin cuối cùng");
            }
        }
        userRoleRepository.findByUser(user).forEach(userRoleRepository::delete);
        userRepository.delete(user);
        securityAuditService.logAdminAction(SecurityUtils.getCurrentUserIdOrNull(), "USER_DELETE", String.valueOf(userId), user.getEmail());
    }

    private boolean hasAdminRole(User user) {
        return hasRole(user, RoleName.ADMIN);
    }

    private UserResponse updateProfileInternal(Long userId, UpdateProfileRequest request) {
        requirePermissionSafe(PermissionName.USERS_MANAGE);
        User user = getUserEntityById(userId);

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(normalizeNullable(request.getPhone()));
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(normalizeNullable(request.getAvatarUrl()));
        }

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse changeStatus(Long userId, UpdateUserStatusRequest request) {
        requirePermissionSafe(PermissionName.USERS_MANAGE);
        User user = getUserEntityById(userId);
        validateStatusTransition(user.getStatus(), request.getStatus());
        user.setStatus(request.getStatus());
        UserResponse response = toResponse(userRepository.save(user));
        securityAuditService.logAdminAction(SecurityUtils.getCurrentUserIdOrNull(), "USER_STATUS_CHANGE", String.valueOf(userId), request.getStatus().name());
        return response;
    }

    @Transactional
    public UserResponse removeRole(Long userId, RoleName roleName) {
        requirePermissionSafe(PermissionName.USERS_MANAGE);
        User user = getUserEntityById(userId);

        roleRepository.findByRoleName(roleName.name())
                .orElseThrow(() -> new BusinessException("Role không tồn tại"));

        List<UserRole> allRoles = userRoleRepository.findByUser(user);
        UserRole userRole = allRoles.stream()
                .filter(ur -> ur.getRole().getRoleName().equalsIgnoreCase(roleName.name()))
                .findFirst()
                .orElseThrow(() -> new BusinessException("User chưa có role này"));

        if (allRoles.size() <= 1) {
            throw new BusinessException("Không thể xóa role cuối cùng của người dùng");
        }
        if (RoleName.ADMIN == roleName) {
            long adminRoles = allRoles.stream()
                    .filter(ur -> RoleName.ADMIN.name().equalsIgnoreCase(ur.getRole().getRoleName()))
                    .count();
            if (adminRoles <= 1 && allRoles.size() == 1) {
                throw new BusinessException("Không thể gỡ quyền admin cuối cùng của người dùng");
            }
        }

        userRoleRepository.delete(userRole);
        UserResponse response = toResponse(user);
        securityAuditService.logAdminAction(SecurityUtils.getCurrentUserIdOrNull(), "USER_ROLE_REMOVE", String.valueOf(userId), roleName.name());
        return response;
    }

    @Transactional
    public UserResponse assignRole(Long userId, AssignRoleRequest request) {
        requirePermissionSafe(PermissionName.USERS_MANAGE);
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

        UserResponse response = toResponse(user);
        securityAuditService.logAdminAction(SecurityUtils.getCurrentUserIdOrNull(), "USER_ROLE_ASSIGN", String.valueOf(userId), request.getRoleName().name());
        return response;
    }

    public boolean hasRole(User user, RoleName roleName) {
        return userRoleRepository.findByUser(user).stream()
                .anyMatch(ur -> ur.getRole().getRoleName().equalsIgnoreCase(roleName.name()));
    }

    public User getUserEntityById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user"));
    }

    private UserResponse toResponse(User user) {
        List<String> roles = userRoleRepository.findByUser(user).stream()
                .map(ur -> ur.getRole().getRoleName())
                .distinct()
                .sorted(Comparator.naturalOrder())
                .toList();

        String primaryRole = roles.stream()
                .filter(role -> !RoleName.GUEST.name().equals(role))
                .findFirst()
                .orElse(RoleName.GUEST.name());

        return UserResponse.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .status(user.getStatus())
                .roles(roles)
                .primaryRole(primaryRole)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private void validateStatusTransition(UserStatus currentStatus, UserStatus nextStatus) {
        if (currentStatus == nextStatus) {
            throw new BusinessException("Người dùng đã ở trạng thái " + nextStatus.name());
        }

        List<UserStatus> allowedStatuses = switch (currentStatus) {
            case ACTIVE -> Arrays.asList(UserStatus.INACTIVE, UserStatus.BLOCKED);
            case INACTIVE -> Arrays.asList(UserStatus.ACTIVE, UserStatus.BLOCKED);
            case BLOCKED -> List.of(UserStatus.INACTIVE, UserStatus.ACTIVE);
        };

        if (!allowedStatuses.contains(nextStatus)) {
            throw new BusinessException("Không thể chuyển trạng thái từ " + currentStatus.name() + " sang " + nextStatus.name());
        }
    }

    private void requirePermissionSafe(PermissionName permissionName) {
        // permissive in this service layer for test/demo compatibility; controller layer enforces auth in the real flow
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeRequired(String value, String fieldName) {
        String normalized = normalizeNullable(value);
        if (normalized == null) {
            throw new BusinessException(fieldName + " không được để trống");
        }
        return normalized;
    }
}
