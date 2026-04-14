package com.bicap.core.security;

import com.bicap.core.exception.BusinessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static CustomUserPrincipal getCurrentUserOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserPrincipal principal)) {
            return null;
        }
        return principal;
    }

    public static CustomUserPrincipal getCurrentUser() {
        CustomUserPrincipal principal = getCurrentUserOrNull();
        if (principal == null) {
            throw new BusinessException("Không xác định được người dùng hiện tại");
        }
        return principal;
    }

    public static Long getCurrentUserId() {
        return getCurrentUser().getUserId();
    }

    public static Long getCurrentUserIdOrNull() {
        CustomUserPrincipal principal = getCurrentUserOrNull();
        return principal != null ? principal.getUserId() : null;
    }
}
