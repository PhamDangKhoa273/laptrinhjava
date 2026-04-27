package com.bicap.modules.common.notification.service;

import com.bicap.modules.common.notification.dto.CreateNotificationRequest;
import org.springframework.stereotype.Component;

@Component
public class NotificationDispatcher {
    private final NotificationService notificationService;

    public NotificationDispatcher(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public void send(Long recipientUserId, String recipientRole, String title, String message, String eventType, String targetType, Long targetId) {
        CreateNotificationRequest request = new CreateNotificationRequest();
        request.setRecipientUserId(recipientUserId);
        request.setRecipientRole(recipientRole);
        request.setTitle(title);
        request.setMessage(message);
        request.setNotificationType(eventType);
        request.setTargetType(targetType);
        request.setTargetId(targetId);
        notificationService.create(request);
    }
}
