package com.bicap.modules.common.notification.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.common.notification.dto.CreateNotificationRequest;
import com.bicap.modules.common.notification.dto.NotificationResponse;
import com.bicap.modules.common.notification.entity.Notification;
import com.bicap.modules.common.notification.repository.NotificationRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public NotificationResponse create(CreateNotificationRequest request) {
        if ((request.getRecipientUserId() == null && (request.getRecipientRole() == null || request.getRecipientRole().isBlank()))
                || (request.getRecipientUserId() != null && request.getRecipientRole() != null && !request.getRecipientRole().isBlank())) {
            throw new BusinessException("Phải chỉ định đúng một đích nhận: recipientUserId hoặc recipientRole");
        }

        Notification notification = new Notification();
        User sender = userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy người gửi"));
        notification.setSenderUser(sender);

        if (request.getRecipientUserId() != null) {
            User recipient = userRepository.findById(request.getRecipientUserId())
                    .orElseThrow(() -> new BusinessException("Không tìm thấy người nhận"));
            notification.setRecipientUser(recipient);
        } else {
            notification.setRecipientRole(request.getRecipientRole().trim().toUpperCase());
        }

        notification.setTitle(request.getTitle().trim());
        notification.setMessage(request.getMessage().trim());
        notification.setNotificationType(request.getNotificationType().trim().toUpperCase());
        notification.setTargetType(request.getTargetType() != null ? request.getTargetType().trim().toUpperCase() : null);
        notification.setTargetId(request.getTargetId());
        notification.setRead(false);

        return toResponse(notificationRepository.save(notification));
    }

    public List<NotificationResponse> getMyNotifications() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy người dùng hiện tại"));

        List<NotificationResponse> result = new ArrayList<>();
        notificationRepository.findByRecipientUserUserIdOrderByCreatedAtDesc(currentUserId)
                .stream()
                .map(this::toResponse)
                .forEach(result::add);

        currentUser.getRoles().forEach(role -> notificationRepository.findByRecipientRoleOrderByCreatedAtDesc(role.getRoleName())
                .stream()
                .map(this::toResponse)
                .forEach(result::add));

        result.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return result;
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy notification"));
        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    private NotificationResponse toResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setNotificationId(notification.getNotificationId());
        response.setSenderUserId(notification.getSenderUser() != null ? notification.getSenderUser().getUserId() : null);
        response.setSenderName(notification.getSenderUser() != null ? notification.getSenderUser().getFullName() : null);
        response.setRecipientUserId(notification.getRecipientUser() != null ? notification.getRecipientUser().getUserId() : null);
        response.setRecipientRole(notification.getRecipientRole());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setNotificationType(notification.getNotificationType());
        response.setTargetType(notification.getTargetType());
        response.setTargetId(notification.getTargetId());
        response.setRead(notification.isRead());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }
}
