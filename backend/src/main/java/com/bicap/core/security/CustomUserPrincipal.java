package com.bicap.core.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;

public class CustomUserPrincipal implements UserDetails {
    private Long userId;
    private String email;
    private String password;
    private String fullName;
    private Collection<? extends GrantedAuthority> authorities;

    public CustomUserPrincipal(Long userId, String email, String password, String fullName, 
                                Collection<? extends GrantedAuthority> authorities) {
        this.userId = userId;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
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
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
}
