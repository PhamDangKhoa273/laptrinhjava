package com.bicap.modules.common.notification.repository;

import com.bicap.modules.common.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientUserUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByRecipientRoleOrderByCreatedAtDesc(String recipientRole);
    long countBySenderUserUserIdAndCreatedAtAfter(Long senderUserId, LocalDateTime after);
}
