package com.bicap.modules.user.service;

import com.bicap.modules.user.dto.UpdateUserStatusRequest;
import com.bicap.modules.user.dto.UserResponse;
import com.bicap.modules.user.dto.AssignRoleRequest;
import com.bicap.modules.user.dto.CreateUserRequest;
import com.bicap.modules.user.dto.UpdateProfileRequest;
import com.bicap.modules.user.entity.Role;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.entity.UserRole;
import com.bicap.core.enums.RoleName;
import com.bicap.core.enums.UserStatus;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.user.repository.RoleRepository;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.repository.UserRoleRepository;
import com.bicap.core.security.SecurityUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       UserRoleRepository userRoleRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse createUserByAdmin(CreateUserRequest request) {
        RoleName defaultRole = request.getInitialRole() != null ? request.getInitialRole() : RoleName.GUEST;
        return createUserInternal(request, defaultRole, UserStatus.ACTIVE);
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
        user.setFullName(normalizeNullable(fullName));
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setPhone(normalizeNullable(phone));
        user.setAvatarUrl(normalizeNullable(avatarUrl));
        user.setStatus(UserStatus.ACTIVE);

        User savedUser = userRepository.save(user);

        Role role = roleRepository.findByRoleName(defaultRole.name())
                .orElseThrow(() -> new BusinessException("Không tìm thấy role mặc định"));

        UserRole userRole = new UserRole();
        userRole.setUser(savedUser);
        userRole.setRole(role);
        userRoleRepository.save(userRole);

        return savedUser;
    }

    private UserResponse createUserInternal(CreateUserRequest request,
                                            RoleName defaultRole,
                                            UserStatus defaultStatus) {

        String normalizedEmail = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BusinessException("Email đã tồn tại");
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(normalizeNullable(request.getPhone()));
        user.setAvatarUrl(normalizeNullable(request.getAvatarUrl()));
        user.setStatus(defaultStatus);

        User savedUser = userRepository.save(user);

        Role role = roleRepository.findByRoleName(defaultRole.name())
                .orElseThrow(() -> new BusinessException("Không tìm thấy role mặc định"));

        UserRole userRole = new UserRole();
        userRole.setUser(savedUser);
        userRole.setRole(role);
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

    private UserResponse updateProfileInternal(Long userId, UpdateProfileRequest request) {
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
        User user = getUserEntityById(userId);
        validateStatusTransition(user.getStatus(), request.getStatus());
        user.setStatus(request.getStatus());
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse removeRole(Long userId, RoleName roleName) {
        User user = getUserEntityById(userId);


        Role role = roleRepository.findByRoleName(roleName.name())

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
        return toResponse(user);
    }

    @Transactional
    public UserResponse assignRole(Long userId, AssignRoleRequest request) {
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

        return toResponse(user);
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

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
