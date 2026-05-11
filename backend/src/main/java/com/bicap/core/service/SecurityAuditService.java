package com.bicap.core.service;

import com.bicap.core.security.MetricsSecurityEvents;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class SecurityAuditService {
    private static final Logger log = LoggerFactory.getLogger(SecurityAuditService.class);
    private final MetricsSecurityEvents metrics;

    public SecurityAuditService(MetricsSecurityEvents metrics) {
        this.metrics = metrics;
    }

    public void logAuthSuccess(String email, String action) {
        metrics.authSuccess.increment();
        log.info("SECURITY_AUTH_SUCCESS action={} email={}", action, email);
    }

    public void logAuthFailure(String email, String action, String reason) {
        metrics.authFail.increment();
        log.warn("SECURITY_AUTH_FAILURE action={} email={} reason={}", action, email, reason);
    }

    public void logAdminAction(Long actorUserId, String action, String target, String result) {
        log.info("SECURITY_ADMIN_ACTION actorUserId={} action={} target={} result={}", actorUserId, action, target, result);
    }

    public void logDomainAction(Long actorUserId, String action, String entityName, Long entityId, String details) {
        log.info("SECURITY_DOMAIN_ACTION actorUserId={} action={} entity={} entityId={} details={}", actorUserId, action, entityName, entityId, details);
    }
}
