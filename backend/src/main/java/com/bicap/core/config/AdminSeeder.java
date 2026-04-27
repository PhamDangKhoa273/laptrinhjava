package com.bicap.core.config;

import com.bicap.modules.user.entity.Role;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.entity.UserRole;
import com.bicap.modules.user.repository.RoleRepository;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private static final String DEFAULT_DEMO_PASSWORD = "123456";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    @Value("${app.demo.seed-enabled:false}")
    private boolean seedEnabled;

    @Value("${app.demo.password:#{null}}")
    private String demoPassword;

    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            return;
        }
        validateDemoSeedSafety();

        Map<String, String> seedAccounts = new LinkedHashMap<>();
        seedAccounts.put("admin@bicap.com", "ADMIN");
        seedAccounts.put("shipping@bicap.com", "SHIPPING_MANAGER");
        seedAccounts.put("driver@bicap.com", "DRIVER");
        seedAccounts.put("farm@bicap.com", "FARM");
        seedAccounts.put("retailer@bicap.com", "RETAILER");
        seedAccounts.put("guest@bicap.com", "GUEST");

        seedAccounts.forEach((email, roleName) -> syncDemoAccount(email, roleName));
    }

    private void validateDemoSeedSafety() {
        if (demoPassword == null || demoPassword.isBlank()) {
            throw new IllegalStateException("Demo seeding is enabled but app.demo.password is not set");
        }
        if (!isLocalOrTestProfile() && DEFAULT_DEMO_PASSWORD.equals(demoPassword)) {
            throw new IllegalStateException("Refusing to seed default demo credentials outside local/test profiles");
        }
    }

    private boolean isLocalOrTestProfile() {
        return Arrays.stream(environment.getActiveProfiles())
                .anyMatch(profile -> profile.equalsIgnoreCase("local") || profile.equalsIgnoreCase("test"));
    }

    private void syncDemoAccount(String email, String roleName) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> {
                    User created = new User();
                    created.setEmail(email);
                    created.setFullName(toDisplayName(roleName));
                    created.setPhone(defaultPhoneFor(roleName));
                    created.setAvatarUrl(null);
                    created.setStatus(com.bicap.core.enums.UserStatus.ACTIVE);
                    created.setPassword(passwordEncoder.encode(demoPassword));
                    return userRepository.save(created);
                });

        if (user.getStatus() != com.bicap.core.enums.UserStatus.ACTIVE) {
            user.setStatus(com.bicap.core.enums.UserStatus.ACTIVE);
        }
        if (user.getPassword() == null || !passwordEncoder.matches(demoPassword, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(demoPassword));
        }
        userRepository.save(user);

        userRoleRepository.findByUser(user).forEach(userRoleRepository::delete);
        Role role = roleRepository.findByRoleName(roleName).orElse(null);
        if (role == null) {
            return;
        }
        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(role);
        userRoleRepository.save(userRole);
    }

    private String toDisplayName(String roleName) {
        return switch (roleName) {
            case "ADMIN" -> "System Admin";
            case "SHIPPING_MANAGER" -> "Shipping Manager";
            case "DRIVER" -> "Driver User";
            case "FARM" -> "Farm Owner";
            case "RETAILER" -> "Retailer User";
            case "GUEST" -> "Guest User";
            default -> "BICAP Demo User";
        };
    }

    private String defaultPhoneFor(String roleName) {
        return switch (roleName) {
            case "ADMIN" -> "0900000001";
            case "FARM" -> "0900000002";
            case "RETAILER" -> "0900000003";
            case "SHIPPING_MANAGER" -> "0900000004";
            case "DRIVER" -> "0900000005";
            case "GUEST" -> "0900000006";
            default -> "0900000099";
        };
    }
}
