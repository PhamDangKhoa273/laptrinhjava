package com.bicap.core.config;

import com.bicap.core.security.JwtAuthenticationFilter;
import com.bicap.core.security.RestAccessDeniedHandler;
import com.bicap.core.security.RestAuthenticationEntryPoint;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class SecurityConfigAuthPolicyTests {

    @Test
    void securityConfigShouldBeConstructibleWithTightAuthPolicy() throws Exception {
        SecurityConfig config = new SecurityConfig(
                mock(JwtAuthenticationFilter.class),
                mock(RestAuthenticationEntryPoint.class),
                mock(RestAccessDeniedHandler.class),
                null
        );
        assertThat(config.passwordEncoder()).isNotNull();
    }
}
