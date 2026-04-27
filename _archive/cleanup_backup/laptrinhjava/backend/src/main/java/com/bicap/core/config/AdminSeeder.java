package com.bicap.core.config;

import com.bicap.modules.user.entity.Role;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.entity.UserRole;
import com.bicap.modules.user.repository.RoleRepository;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.demo.password:123456}")
    private String demoPassword;

    @Override
    public void run(String... args) {
        Map<String, String> seedAccounts = new LinkedHashMap<>();
        seedAccounts.put("admin@bicap.com", "ADMIN");
        seedAccounts.put("shipping@bicap.com", "SHIPPING_MANAGER");
        seedAccounts.put("driver@bicap.com", "DRIVER");
        seedAccounts.put("farm@bicap.com", "FARM");
        seedAccounts.put("retailer@bicap.com", "RETAILER");
        seedAccounts.put("guest@bicap.com", "GUEST");

        seedAccounts.forEach((email, roleName) -> syncDemoAccount(email, roleName));
    }

    private void syncDemoAccount(String email, String roleName) {
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        if (userOpt.isEmpty()) {
            return;
        }

        User user = userOpt.get();
        if (user.getPassword() == null || !passwordEncoder.matches(demoPassword, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(demoPassword));
            userRepository.save(user);
        }

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
}
