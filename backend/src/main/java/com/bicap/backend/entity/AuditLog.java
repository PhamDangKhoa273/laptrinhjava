package com.bicap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "action", length = 100, nullable = false)
    private String action;

    @Column(name = "entity_name", length = 100, nullable = false)
    private String entityName;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
