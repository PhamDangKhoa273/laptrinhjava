package com.bicap.backend.security;

import com.bicap.backend.exception.BusinessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static CustomUserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserPrincipal principal)) {
            throw new BusinessException("Không xác định được người dùng hiện tại");
        }

        return principal;
    }

    public static Long getCurrentUserId() {
        return getCurrentUser().getUserId();
    }
}