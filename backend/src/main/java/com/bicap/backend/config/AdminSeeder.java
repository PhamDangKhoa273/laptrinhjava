package com.bicap.core.config;

import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "admin@bicap.com";
        String adminPassword = "Admin123";

        Optional<User> adminOpt = userRepository.findByEmailIgnoreCase(adminEmail);
        
        if (adminOpt.isPresent()) {
            User admin = adminOpt.get();
            // Force update password to 'Admin123' to ensure hash compatibility
            admin.setPassword(passwordEncoder.encode(adminPassword));
            userRepository.save(admin);
            System.out.println(">>> [SECURITY] Password for " + adminEmail + " has been force-reset to: " + adminPassword);
        } else {
            System.err.println(">>> [SECURITY] ERROR: Admin user " + adminEmail + " not found in database!");
        }
    }
}
