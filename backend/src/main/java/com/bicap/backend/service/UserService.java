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
import com.bicap.backend.security.SecurityUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        return createUserInternal(request, RoleName.GUEST, UserStatus.ACTIVE);
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
        user.setStatus(request.getStatus());
        return toResponse(userRepository.save(user));
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
