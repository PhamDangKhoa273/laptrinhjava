package com.bicap.core.config;

import com.bicap.core.security.JwtAuthenticationFilter;
import com.bicap.core.security.RateLimitFilter;
import com.bicap.core.security.RestAccessDeniedHandler;
import com.bicap.core.security.RestAuthenticationEntryPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@EnableConfigurationProperties(com.bicap.modules.media.config.MediaStorageProperties.class)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;
    private final RestAccessDeniedHandler restAccessDeniedHandler;
    private final RateLimitFilter rateLimitFilter;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          RestAuthenticationEntryPoint restAuthenticationEntryPoint,
                          RestAccessDeniedHandler restAccessDeniedHandler,
                          RateLimitFilter rateLimitFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.restAuthenticationEntryPoint = restAuthenticationEntryPoint;
        this.restAccessDeniedHandler = restAccessDeniedHandler;
        this.rateLimitFilter = rateLimitFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'; img-src 'self' data: http: https:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' http: https:;"))
                .frameOptions(frame -> frame.sameOrigin())
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(restAuthenticationEntryPoint)
                .accessDeniedHandler(restAccessDeniedHandler)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/refresh", "/api/v1/auth/forgot-password", "/api/v1/auth/reset-password").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/refresh", "/api/v1/auth/forgot-password", "/api/v1/auth/reset-password").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/logout").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/v1/auth/me", "/api/v1/auth/profile/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/v1/auth/me", "/api/v1/auth/profile/**").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/api/v1/auth/me", "/api/v1/auth/profile/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/v1/auth/logout").authenticated()
                .requestMatchers("/api/v1/public/**").permitAll()
                .requestMatchers("/uploads/public/**").permitAll()
                .requestMatchers("/api/v1/product/trace/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/trace/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/listings", "/api/v1/listings/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/announcements/active", "/api/v1/announcements/feed").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/content", "/api/v1/content/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/batches/*/verify").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/notifications/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/v1/categories", "/api/v1/products", "/api/v1/search").permitAll()
                .requestMatchers("/api/v1/farm/**", "/api/farm/**").hasRole("FARM")
                .requestMatchers("/api/v1/admin/**", "/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterAfter(rateLimitFilter, JwtAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
