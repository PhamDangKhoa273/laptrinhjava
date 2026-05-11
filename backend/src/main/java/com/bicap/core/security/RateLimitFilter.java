package com.bicap.core.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.bicap.core.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final RedisRateLimitService rateLimitService;
    private final ClientIpResolver clientIpResolver;
    private final MetricsSecurityEvents metrics;

    @Value("${app.rate-limit.route-class:default}")
    private String routeClass;

    public RateLimitFilter(RedisRateLimitService rateLimitService, ClientIpResolver clientIpResolver, MetricsSecurityEvents metrics) {
        this.rateLimitService = rateLimitService;
        this.clientIpResolver = clientIpResolver;
        this.metrics = metrics;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();

        if (path.startsWith("/api/v1/auth/me")) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = clientIpResolver.resolve(request);
        String userId = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : null;
        String routeIdentity = request.getRequestURI();

        try {
            rateLimitService.checkPerIp(ip);
            if (userId != null && !userId.isBlank()) {
                rateLimitService.checkPerUser(userId);
            }
            rateLimitService.checkPerRouteClass(routeClass, routeIdentity);
            filterChain.doFilter(request, response);
        } catch (BusinessException ex) {
            metrics.rateLimitTriggered.increment();
            throw ex;
        }
    }
}
