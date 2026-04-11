package com.bicap.core.security;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;

import com.bicap.modules.user.entity.User;

import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("Email hoặc mật khẩu không đúng"));

        return new CustomUserPrincipal(
                user.getUserId(),
                user.getEmail(),
                user.getPassword(),
                user.getStatus() != null ? user.getStatus().name() : null,
                userRoleRepository.findByUser(user).stream()
                        .map(ur -> new SimpleGrantedAuthority("ROLE_" + ur.getRole().getRoleName()))
                        .collect(Collectors.toList())
        );
    }
}
