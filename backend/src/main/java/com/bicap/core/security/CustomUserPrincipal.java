package com.bicap.core.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.Set;

public class CustomUserPrincipal implements UserDetails {
    private static final Set<String> VALID_STATUSES = Set.of("ACTIVE", "INACTIVE", "BLOCKED", "DELETED");

    private Long userId;
    private String email;
    private String password;
    private String fullName;
    private String status;
    private Collection<? extends GrantedAuthority> authorities;

    public CustomUserPrincipal(Long userId, String email, String password, String statusOrFullName,
                                Collection<? extends GrantedAuthority> authorities) {
        this(userId, email, password, resolveFullName(statusOrFullName), resolveStatus(statusOrFullName), authorities);
    }

    public CustomUserPrincipal(Long userId, String email, String password, String fullName, String status,
                                Collection<? extends GrantedAuthority> authorities) {
        this.userId = userId;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.status = status;
        this.authorities = authorities;
    }

    public Long getUserId() { return userId; }
    public String getFullName() { return fullName; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override
    public String getPassword() { return password; }
    @Override
    public String getUsername() { return email; }
    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return !"BLOCKED".equals(status); }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return "ACTIVE".equals(status); }

    private static String resolveStatus(String statusOrFullName) {
        return VALID_STATUSES.contains(statusOrFullName) ? statusOrFullName : "ACTIVE";
    }

    private static String resolveFullName(String statusOrFullName) {
        return VALID_STATUSES.contains(statusOrFullName) ? null : statusOrFullName;
    }
}
