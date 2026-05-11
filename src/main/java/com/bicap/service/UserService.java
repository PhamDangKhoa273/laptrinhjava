package com.bicap.service;

import com.bicap.entity.User;
import com.bicap.common.UserRole;
import com.bicap.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Tạo người dùng mới
     */
    @Transactional
    public User createUser(String username,
                           String rawPassword,
                           UserRole role,
                           String businessLicense) {
        
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username already exists: " + username);
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setBusinessLicense(businessLicense);
        
        return userRepository.save(user);
    }
}
