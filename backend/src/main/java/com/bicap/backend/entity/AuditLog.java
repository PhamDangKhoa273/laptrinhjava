<<<<<<< Updated upstream:backend/src/main/java/com/bicap/backend/entity/AuditLog.java
package com.bicap.backend.entity;
=======
package com.bicap.core;
>>>>>>> Stashed changes:backend/src/main/java/com/bicap/core/AuditLog.java

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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

    // Manual Getters/Setters for Lombok fallback
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getEntityName() { return entityName; }
    public void setEntityName(String entityName) { this.entityName = entityName; }
    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
<<<<<<< Updated upstream:backend/src/main/java/com/bicap/backend/entity/AuditLog.java
=======

>>>>>>> Stashed changes:backend/src/main/java/com/bicap/core/AuditLog.java
}
