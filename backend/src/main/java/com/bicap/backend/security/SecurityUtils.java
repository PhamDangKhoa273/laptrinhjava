<<<<<<< Updated upstream:backend/src/main/java/com/bicap/backend/security/SecurityUtils.java
package com.bicap.backend.security;

import com.bicap.backend.exception.BusinessException;
=======
package com.bicap.core.security;

import com.bicap.core.exception.BusinessException;
>>>>>>> Stashed changes:backend/src/main/java/com/bicap/core/security/SecurityUtils.java
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
