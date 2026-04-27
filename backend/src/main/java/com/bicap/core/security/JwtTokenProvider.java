package com.bicap.core.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    private Key key;

    @PostConstruct
    public void init() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException("app.jwt.secret is required (set APP_JWT_SECRET)");
        }
        if (jwtSecret.length() < 32) {
            throw new IllegalStateException("app.jwt.secret must be at least 32 characters");
        }
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(CustomUserPrincipal principal) {
        return buildToken(principal, jwtExpirationMs, "access");
    }

    public String generateRefreshToken(CustomUserPrincipal principal) {
        return buildToken(principal, refreshExpirationMs, "refresh");
    }

    private String buildToken(CustomUserPrincipal principal, long expirationMs, String tokenType) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        String jti = java.util.UUID.randomUUID().toString();

        return Jwts.builder()
                .subject(principal.getUsername())
                .id(jti)
                .claim("userId", principal.getUserId())
                .claim("type", tokenType)
                .claim("roles", principal.getAuthorities().stream()
                        .map(Object::toString)
                        .toList())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public Long getUserIdFromToken(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("userId", Long.class);
    }

    public String getTokenType(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("type", String.class);
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith((javax.crypto.SecretKey) key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    public String getJwtSecret() { return jwtSecret; }
    public void setJwtSecret(String jwtSecret) { this.jwtSecret = jwtSecret; }

    public long getJwtExpirationMs() { return jwtExpirationMs; }
    public void setJwtExpirationMs(long jwtExpirationMs) { this.jwtExpirationMs = jwtExpirationMs; }

    public long getRefreshExpirationMs() { return refreshExpirationMs; }
    public void setRefreshExpirationMs(long refreshExpirationMs) { this.refreshExpirationMs = refreshExpirationMs; }

    public Key getKey() { return key; }
    public void setKey(Key key) { this.key = key; }
}
