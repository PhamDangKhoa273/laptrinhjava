package com.bicap.modules.notification.entity;

import com.bicap.core.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Notification entity - Quản lý thông báo hệ thống
 * Author: Dinh Khang199
 */
@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notification_user", columnList = "user_id"),
        @Index(name = "idx_notification_read", columnList = "is_read"),
        @Index(name = "idx_notification_created", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private NotificationType type;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "reference_type", length = 100)
    private String referenceType;

    @Column(name = "action_url", length = 500)
    private String actionUrl;

    @Column(name = "icon_url", length = 500)
    private String iconUrl;

    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    /**
     * Đánh dấu thông báo đã đọc
     */
    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }

    /**
     * Kiểm tra thông báo đã hết hạn chưa
     */
    public boolean isExpired() {
        if (this.expiresAt == null) return false;
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    /**
     * Kiểm tra thông báo có hiệu lực không
     */
    public boolean isActive() {
        return !isExpired() && !isRead;
    }
}
