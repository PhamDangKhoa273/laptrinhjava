package com.bicap.modules.notification.service;

import com.bicap.core.dto.PagedResponse;
import com.bicap.core.enums.NotificationType;
import com.bicap.modules.notification.dto.CreateNotificationRequest;
import com.bicap.modules.notification.dto.NotificationResponse;
import com.bicap.modules.notification.entity.Notification;
import com.bicap.modules.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service xử lý nghiệp vụ thông báo
 * Author: Dinh Khang199
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // ==================== Tạo thông báo ====================

    /**
     * Tạo thông báo mới cho một người dùng
     */
    @Transactional
    public NotificationResponse createNotification(CreateNotificationRequest request) {
        log.info("Tạo thông báo cho userId={}, type={}", request.getUserId(), request.getType());

        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType())
                .referenceId(request.getReferenceId())
                .referenceType(request.getReferenceType())
                .actionUrl(request.getActionUrl())
                .iconUrl(request.getIconUrl())
                .metadata(request.getMetadata())
                .expiresAt(request.getExpiresAt())
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Đã tạo thông báo id={} cho userId={}", saved.getId(), saved.getUserId());
        return NotificationResponse.fromEntity(saved);
    }

    /**
     * Gửi thông báo đến nhiều người dùng cùng lúc
     */
    @Transactional
    public List<NotificationResponse> broadcastNotification(
            List<Long> userIds,
            String title,
            String message,
            NotificationType type
    ) {
        log.info("Broadcast thông báo type={} đến {} người dùng", type, userIds.size());

        List<Notification> notifications = userIds.stream()
                .map(userId -> Notification.builder()
                        .userId(userId)
                        .title(title)
                        .message(message)
                        .type(type)
                        .isRead(false)
                        .build())
                .collect(Collectors.toList());

        List<Notification> saved = notificationRepository.saveAll(notifications);
        log.info("Đã broadcast {} thông báo", saved.size());
        return saved.stream().map(NotificationResponse::fromEntity).collect(Collectors.toList());
    }

    /**
     * Tạo thông báo hệ thống nhanh
     */
    @Transactional
    public NotificationResponse sendSystemNotification(Long userId, String title, String message) {
        CreateNotificationRequest request = CreateNotificationRequest.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(NotificationType.SYSTEM_ALERT)
                .build();
        return createNotification(request);
    }

    // ==================== Đọc thông báo ====================

    /**
     * Lấy danh sách thông báo của người dùng (phân trang)
     */
    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> getNotificationsByUser(
            Long userId, int page, int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> pageData = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageable);

        List<NotificationResponse> content = pageData.getContent()
                .stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());

        return PagedResponse.<NotificationResponse>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .last(pageData.isLast())
                .build();
    }

    /**
     * Lấy danh sách thông báo chưa đọc
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        return notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Đếm số thông báo chưa đọc
     */
    @Transactional(readOnly = true)
    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * Lấy thông báo theo loại
     */
    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> getByType(Long userId, NotificationType type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> pageData = notificationRepository
                .findByUserIdAndTypeOrderByCreatedAtDesc(userId, type, pageable);

        List<NotificationResponse> content = pageData.getContent()
                .stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());

        return PagedResponse.<NotificationResponse>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .last(pageData.isLast())
                .build();
    }

    // ==================== Đánh dấu đã đọc ====================

    /**
     * Đánh dấu một thông báo là đã đọc
     */
    @Transactional
    public boolean markAsRead(Long notificationId, Long userId) {
        int updated = notificationRepository.markAsReadByIdAndUserId(
                notificationId, userId, LocalDateTime.now()
        );
        if (updated > 0) {
            log.info("Đã đánh dấu thông báo id={} đã đọc cho userId={}", notificationId, userId);
            return true;
        }
        log.warn("Không tìm thấy thông báo id={} cho userId={}", notificationId, userId);
        return false;
    }

    /**
     * Đánh dấu nhiều thông báo là đã đọc
     */
    @Transactional
    public int markMultipleAsRead(List<Long> notificationIds, Long userId) {
        int updated = notificationRepository.markMultipleAsRead(notificationIds, userId, LocalDateTime.now());
        log.info("Đã đánh dấu {} thông báo đã đọc cho userId={}", updated, userId);
        return updated;
    }

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     */
    @Transactional
    public int markAllAsRead(Long userId) {
        int updated = notificationRepository.markAllAsReadByUserId(userId, LocalDateTime.now());
        log.info("Đã đánh dấu tất cả {} thông báo đã đọc cho userId={}", updated, userId);
        return updated;
    }

    // ==================== Xóa thông báo ====================

    /**
     * Xóa một thông báo của người dùng
     */
    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        notificationRepository.deleteByIdAndUserId(notificationId, userId);
        log.info("Đã xóa thông báo id={} của userId={}", notificationId, userId);
    }

    /**
     * Xóa tất cả thông báo đã đọc của người dùng
     */
    @Transactional
    public int deleteAllRead(Long userId) {
        int deleted = notificationRepository.deleteAllReadByUserId(userId);
        log.info("Đã xóa {} thông báo đã đọc của userId={}", deleted, userId);
        return deleted;
    }

    // ==================== Thống kê ====================

    /**
     * Thống kê thông báo theo loại cho người dùng
     */
    @Transactional(readOnly = true)
    public Map<String, Long> getNotificationStats(Long userId) {
        List<Object[]> results = notificationRepository.countByTypeForUser(userId);
        Map<String, Long> stats = new HashMap<>();
        for (Object[] row : results) {
            NotificationType type = (NotificationType) row[0];
            Long count = (Long) row[1];
            stats.put(type.name(), count);
        }
        stats.put("TOTAL_UNREAD", notificationRepository.countByUserIdAndIsReadFalse(userId));
        stats.put("TOTAL", notificationRepository.countByUserId(userId));
        return stats;
    }

    // ==================== Scheduled Tasks ====================

    /**
     * Tự động xóa thông báo hết hạn - chạy mỗi ngày lúc 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void cleanupExpiredNotifications() {
        log.info("Bắt đầu dọn dẹp thông báo hết hạn...");
        int deleted = notificationRepository.deleteExpiredNotifications(LocalDateTime.now());
        log.info("Đã xóa {} thông báo hết hạn", deleted);
    }
}
