package com.bicap.modules.notification.dto;

import com.bicap.core.enums.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO trả về thông tin thông báo
 * Author: Dinh Khang199
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private Long id;
    private Long userId;
    private String title;
    private String message;
    private NotificationType type;
    private String typeDisplayName;
    private Boolean isRead;
    private Long referenceId;
    private String referenceType;
    private String actionUrl;
    private String iconUrl;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private LocalDateTime expiresAt;
    private Boolean isExpired;
    private Boolean isActive;

    // ==================== Static factory methods ====================

    public static NotificationResponse fromEntity(com.bicap.modules.notification.entity.Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .typeDisplayName(notification.getType() != null ? notification.getType().getDisplayName() : null)
                .isRead(notification.getIsRead())
                .referenceId(notification.getReferenceId())
                .referenceType(notification.getReferenceType())
                .actionUrl(notification.getActionUrl())
                .iconUrl(notification.getIconUrl())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .expiresAt(notification.getExpiresAt())
                .isExpired(notification.isExpired())
                .isActive(notification.isActive())
                .build();
    }
}
