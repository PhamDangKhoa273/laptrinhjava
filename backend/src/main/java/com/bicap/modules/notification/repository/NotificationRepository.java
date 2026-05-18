package com.bicap.modules.notification.repository;

import com.bicap.modules.notification.entity.Notification;
import com.bicap.core.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository quản lý thông báo
 * Author: Dinh Khang199
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // ==================== Tìm theo userId ====================

    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    Page<Notification> findByUserIdAndIsReadOrderByCreatedAtDesc(Long userId, Boolean isRead, Pageable pageable);

    Page<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, NotificationType type, Pageable pageable);

    Optional<Notification> findByIdAndUserId(Long id, Long userId);

    // ==================== Đếm thông báo ====================

    long countByUserIdAndIsReadFalse(Long userId);

    long countByUserId(Long userId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.isRead = false AND n.type = :type")
    long countUnreadByUserIdAndType(@Param("userId") Long userId, @Param("type") NotificationType type);

    // ==================== Đánh dấu đã đọc ====================

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.userId = :userId AND n.isRead = false")
    int markAllAsReadByUserId(@Param("userId") Long userId, @Param("readAt") LocalDateTime readAt);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.id = :id AND n.userId = :userId")
    int markAsReadByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId, @Param("readAt") LocalDateTime readAt);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.id IN :ids AND n.userId = :userId")
    int markMultipleAsRead(@Param("ids") List<Long> ids, @Param("userId") Long userId, @Param("readAt") LocalDateTime readAt);

    // ==================== Xóa thông báo ====================

    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.userId = :userId AND n.isRead = true")
    int deleteAllReadByUserId(@Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.expiresAt IS NOT NULL AND n.expiresAt < :now")
    int deleteExpiredNotifications(@Param("now") LocalDateTime now);

    @Modifying
    @Transactional
    void deleteByIdAndUserId(Long id, Long userId);

    // ==================== Tìm theo reference ====================

    List<Notification> findByReferenceIdAndReferenceType(Long referenceId, String referenceType);

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.referenceId = :referenceId AND n.referenceType = :referenceType ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdAndReference(
            @Param("userId") Long userId,
            @Param("referenceId") Long referenceId,
            @Param("referenceType") String referenceType
    );

    // ==================== Tìm kiếm nâng cao ====================

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId " +
           "AND (:type IS NULL OR n.type = :type) " +
           "AND (:isRead IS NULL OR n.isRead = :isRead) " +
           "AND (:fromDate IS NULL OR n.createdAt >= :fromDate) " +
           "AND (:toDate IS NULL OR n.createdAt <= :toDate) " +
           "ORDER BY n.createdAt DESC")
    Page<Notification> searchNotifications(
            @Param("userId") Long userId,
            @Param("type") NotificationType type,
            @Param("isRead") Boolean isRead,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable
    );

    // ==================== Thống kê ====================

    @Query("SELECT n.type, COUNT(n) FROM Notification n WHERE n.userId = :userId GROUP BY n.type")
    List<Object[]> countByTypeForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.createdAt >= :since")
    long countNotificationsSince(@Param("since") LocalDateTime since);
}
