package com.bicap.core.security;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CustomUserPrincipalTests {

    @Test
    void inactiveUser_shouldBeDisabled() {
        CustomUserPrincipal principal = new CustomUserPrincipal(1L, "user@example.com", "secret", "User", "INACTIVE", List.of());

        assertThat(principal.isEnabled()).isFalse();
        assertThat(principal.isAccountNonLocked()).isTrue();
    }

    @Test
    void blockedUser_shouldBeDisabledAndLocked() {
        CustomUserPrincipal principal = new CustomUserPrincipal(1L, "user@example.com", "secret", "User", "BLOCKED", List.of());

        assertThat(principal.isEnabled()).isFalse();
        assertThat(principal.isAccountNonLocked()).isFalse();
    }
}
