package com.bicap.backend.service;

import com.bicap.backend.entity.AuditLog;
import com.bicap.backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(Long userId, String action, String entityName, Long entityId) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setAction(action);
        log.setEntityName(entityName);
        log.setEntityId(entityId);
        log.setCreatedAt(LocalDateTime.now());

        auditLogRepository.save(log);
    }
}
