package com.bicap.core.config;

import com.bicap.modules.user.entity.Role;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.entity.UserRole;
import com.bicap.modules.user.repository.RoleRepository;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.repository.UserRoleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminSeederTests {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private UserRoleRepository userRoleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    void run_shouldDoNothingWhenDemoSeedingIsDisabled() {
        AdminSeeder seeder = buildSeeder(new MockEnvironment().withProperty("spring.profiles.active", "prod"), false, null);

        seeder.run();

        verify(userRepository, never()).findByEmailIgnoreCase(any());
        verify(userRepository, never()).save(any());
        verify(userRoleRepository, never()).save(any());
    }

    @Test
    void run_shouldRejectDefaultDemoPasswordOutsideLocalAndTestProfiles() {
        AdminSeeder seeder = buildSeeder(new MockEnvironment().withProperty("spring.profiles.active", "prod"), true, "123456");

        assertThrows(IllegalStateException.class, seeder::run);

        verify(userRepository, never()).findByEmailIgnoreCase(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void run_shouldCreateDemoAccountsWhenEnabledForLocalProfile() {
        Role adminRole = new Role();
        adminRole.setRoleName("ADMIN");
        User savedUser = new User();
        savedUser.setEmail("admin@bicap.com");
        savedUser.setPassword("encoded");

        when(userRepository.findByEmailIgnoreCase(any())).thenReturn(Optional.empty());
        when(passwordEncoder.encode("123456")).thenReturn("encoded");
        when(passwordEncoder.matches("123456", "encoded")).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(userRoleRepository.findByUser(savedUser)).thenReturn(List.of());
        when(roleRepository.findByRoleName(any())).thenReturn(Optional.of(adminRole));

        AdminSeeder seeder = buildSeeder(new MockEnvironment().withProperty("spring.profiles.active", "local"), true, "123456");

        seeder.run();

        verify(userRepository).findByEmailIgnoreCase("admin@bicap.com");
        verify(userRepository).findByEmailIgnoreCase("shipping@bicap.com");
        verify(userRepository).findByEmailIgnoreCase("driver@bicap.com");
        verify(userRepository).findByEmailIgnoreCase("farm@bicap.com");
        verify(userRepository).findByEmailIgnoreCase("retailer@bicap.com");
        verify(userRepository).findByEmailIgnoreCase("guest@bicap.com");
        verify(userRoleRepository, org.mockito.Mockito.times(6)).save(any(UserRole.class));
    }

    private AdminSeeder buildSeeder(Environment environment, boolean seedEnabled, String demoPassword) {
        AdminSeeder seeder = new AdminSeeder(
                userRepository,
                roleRepository,
                userRoleRepository,
                passwordEncoder,
                environment
        );
        ReflectionTestUtils.setField(seeder, "seedEnabled", seedEnabled);
        ReflectionTestUtils.setField(seeder, "demoPassword", demoPassword);
        return seeder;
    }
}
