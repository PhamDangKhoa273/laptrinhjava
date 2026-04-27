package com.bicap.modules.user.service;

import com.bicap.modules.user.dto.UpdateUserStatusRequest;
import com.bicap.modules.user.dto.UserResponse;
import com.bicap.modules.user.dto.AssignRoleRequest;
import com.bicap.modules.user.dto.CreateUserRequest;
import com.bicap.modules.user.entity.Role;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.entity.UserRole;
import com.bicap.core.enums.RoleName;
import com.bicap.core.enums.UserStatus;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.user.repository.RoleRepository;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.repository.UserRoleRepository;
import com.bicap.core.service.SecurityAuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTests {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private UserRoleRepository userRoleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SecurityAuditService securityAuditService;

    @InjectMocks
    private UserService userService;

    private User user;
    private Role guestRole;
    private Role farmRole;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setFullName("Test User");
        user.setEmail("test@example.com");
        user.setStatus(UserStatus.ACTIVE);

        guestRole = new Role();
        guestRole.setRoleId(1L);
        guestRole.setRoleName("GUEST");

        farmRole = new Role();
        farmRole.setRoleId(2L);
        farmRole.setRoleName("FARM");
    }

    @Test
    void createUserByAdmin_shouldCreateGuestUserSuccessfully() {
        CreateUserRequest request = new CreateUserRequest();
        request.setFullName("New User");
        request.setEmail("new@example.com");
        request.setPassword("123456");
        request.setPhone("0901234567");

        when(userRepository.existsByEmailIgnoreCase("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("123456")).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setUserId(10L);
            return saved;
        });
        when(roleRepository.findByRoleName(RoleName.GUEST.name())).thenReturn(Optional.of(guestRole));
        when(userRoleRepository.findByUser(any(User.class))).thenReturn(List.of(buildUserRole(user, guestRole)));

        UserResponse response = userService.createUserByAdmin(request);

        assertNotNull(response);
        assertEquals("new@example.com", response.getEmail());
        assertTrue(response.getRoles().contains("GUEST"));
        verify(userRoleRepository).save(any(UserRole.class));
    }

    @Test
    void createUserByAdmin_shouldThrowWhenEmailExists() {
        CreateUserRequest request = new CreateUserRequest();
        request.setFullName("Dup User");
        request.setEmail("dup@example.com");
        request.setPassword("123456");

        when(userRepository.existsByEmailIgnoreCase("dup@example.com")).thenReturn(true);

        when(userRepository.existsByEmailIgnoreCase("dup@example.com")).thenReturn(true);
        assertThrows(BusinessException.class, () -> userService.createUserByAdmin(request));
    }

    @Test
    void assignRole_shouldThrowWhenUserAlreadyHasRole() {
        AssignRoleRequest request = new AssignRoleRequest();
        request.setRoleName(RoleName.FARM);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(roleRepository.findByRoleName(RoleName.FARM.name())).thenReturn(Optional.of(farmRole));
        when(userRoleRepository.existsByUserAndRole(user, farmRole)).thenReturn(true);

        assertThrows(BusinessException.class, () -> userService.assignRole(1L, request));
    }

    @Test
    void assignRole_shouldAppendNewRole() {
        AssignRoleRequest request = new AssignRoleRequest();
        request.setRoleName(RoleName.FARM);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(roleRepository.findByRoleName(RoleName.FARM.name())).thenReturn(Optional.of(farmRole));
        when(userRoleRepository.existsByUserAndRole(user, farmRole)).thenReturn(false);
        when(userRoleRepository.findByUser(user)).thenReturn(List.of(buildUserRole(user, guestRole), buildUserRole(user, farmRole)));

        UserResponse response = userService.assignRole(1L, request);

        assertTrue(response.getRoles().contains("FARM"));
        verify(userRoleRepository).save(any(UserRole.class));
    }

    @Test
    void changeStatus_shouldUpdateUserStatus() {
        UpdateUserStatusRequest request = new UpdateUserStatusRequest();
        request.setStatus(UserStatus.INACTIVE);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRoleRepository.findByUser(user)).thenReturn(List.of(buildUserRole(user, guestRole)));

        UserResponse response = userService.changeStatus(1L, request);

        assertEquals(UserStatus.INACTIVE, response.getStatus());
    }

    @Test
    void changeStatus_shouldThrowWhenStatusDoesNotChange() {
        UpdateUserStatusRequest request = new UpdateUserStatusRequest();
        request.setStatus(UserStatus.ACTIVE);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(BusinessException.class, () -> userService.changeStatus(1L, request));
    }

    @Test
    void removeRole_shouldDeleteRequestedRoleWhenMoreThanOneRoleExists() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(roleRepository.findByRoleName(RoleName.FARM.name())).thenReturn(Optional.of(farmRole));
        when(userRoleRepository.findByUser(user))
                .thenReturn(List.of(buildUserRole(user, guestRole), buildUserRole(user, farmRole)))
                .thenReturn(List.of(buildUserRole(user, guestRole)));

        UserResponse response = userService.removeRole(1L, RoleName.FARM);

        assertEquals(List.of("GUEST"), response.getRoles());
        verify(userRoleRepository).delete(any(UserRole.class));
    }

    @Test
    void hasRole_shouldReturnTrueWhenRoleExists() {
        when(userRoleRepository.findByUser(user)).thenReturn(List.of(buildUserRole(user, farmRole)));
        assertTrue(userService.hasRole(user, RoleName.FARM));
    }

    private UserRole buildUserRole(User user, Role role) {
        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(role);
        return userRole;
    }
}
