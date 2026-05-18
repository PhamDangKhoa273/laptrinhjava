package com.bicap.modules.notification.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.core.dto.PagedResponse;
import com.bicap.core.enums.NotificationType;
import com.bicap.modules.notification.dto.CreateNotificationRequest;
import com.bicap.modules.notification.dto.NotificationResponse;
import com.bicap.modules.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller quản lý thông báo hệ thống
 * Author: Dinh Khang199
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification", description = "API quản lý thông báo hệ thống")
public class NotificationController {

    private final NotificationService notificationService;

    // ==================== Admin APIs ====================

    /**
     * [ADMIN] Tạo thông báo cho người dùng cụ thể
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo thông báo mới", description = "Chỉ Admin mới có quyền tạo thông báo")
    public ResponseEntity<ApiResponse<NotificationResponse>> createNotification(
            @Valid @RequestBody CreateNotificationRequest request
    ) {
        log.info("POST /api/v1/notifications - Tạo thông báo cho userId={}", request.getUserId());
        NotificationResponse response = notificationService.createNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo thông báo thành công", response));
    }

    /**
     * [ADMIN] Gửi thông báo broadcast đến nhiều người dùng
     */
    @PostMapping("/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Broadcast thông báo", description = "Gửi thông báo đến nhiều người dùng cùng lúc")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> broadcastNotification(
            @RequestParam List<Long> userIds,
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam NotificationType type
    ) {
        log.info("POST /api/v1/notifications/broadcast - Gửi đến {} users", userIds.size());
        List<NotificationResponse> responses = notificationService.broadcastNotification(userIds, title, message, type);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Broadcast thành công", responses));
    }

    // ==================== User APIs ====================

    /**
     * Lấy danh sách thông báo của người dùng hiện tại (phân trang)
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    @Operation(summary = "Lấy danh sách thông báo", description = "Lấy tất cả thông báo của người dùng, phân trang")
    public ResponseEntity<ApiResponse<PagedResponse<NotificationResponse>>> getNotifications(
            @Parameter(description = "ID người dùng") @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("GET /api/v1/notifications/user/{} - page={}, size={}", userId, page, size);
        PagedResponse<NotificationResponse> result = notificationService.getNotificationsByUser(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách thông báo thành công", result));
    }

    /**
     * Lấy danh sách thông báo chưa đọc
     */
    @GetMapping("/user/{userId}/unread")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    @Operation(summary = "Lấy thông báo chưa đọc")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnreadNotifications(
            @PathVariable Long userId
    ) {
        log.info("GET /api/v1/notifications/user/{}/unread", userId);
        List<NotificationResponse> result = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông báo chưa đọc thành công", result));
    }

    /**
     * Đếm số thông báo chưa đọc
     */
    @GetMapping("/user/{userId}/unread-count")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    @Operation(summary = "Đếm thông báo chưa đọc")
    public ResponseEntity<ApiResponse<Long>> countUnread(@PathVariable Long userId) {
        long count = notificationService.countUnread(userId);
        return ResponseEntity.ok(ApiResponse.success("OK", count));
    }

    /**
     * Lấy thông báo theo loại
     */
    @GetMapping("/user/{userId}/type/{type}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    @Operation(summary = "Lấy thông báo theo loại")
    public ResponseEntity<ApiResponse<PagedResponse<NotificationResponse>>> getByType(
            @PathVariable Long userId,
            @PathVariable NotificationType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PagedResponse<NotificationResponse> result = notificationService.getByType(userId, type, page, size);
        return ResponseEntity.ok(ApiResponse.success("OK", result));
    }

    // ==================== Đánh dấu đọc ====================

    /**
     * Đánh dấu một thông báo là đã đọc
     */
    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Đánh dấu đã đọc")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        log.info("PATCH /api/v1/notifications/{}/read for userId={}", id, userId);
        boolean success = notificationService.markAsRead(id, userId);
        if (success) {
            return ResponseEntity.ok(ApiResponse.success("Đánh dấu đã đọc thành công", null));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Không tìm thấy thông báo"));
    }

    /**
     * Đánh dấu nhiều thông báo là đã đọc
     */
    @PatchMapping("/read-multiple")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Đánh dấu nhiều thông báo đã đọc")
    public ResponseEntity<ApiResponse<Integer>> markMultipleAsRead(
            @RequestParam List<Long> ids,
            @RequestParam Long userId
    ) {
        int updated = notificationService.markMultipleAsRead(ids, userId);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu " + updated + " thông báo", updated));
    }

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     */
    @PatchMapping("/user/{userId}/read-all")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    @Operation(summary = "Đánh dấu tất cả đã đọc")
    public ResponseEntity<ApiResponse<Integer>> markAllAsRead(@PathVariable Long userId) {
        int updated = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu " + updated + " thông báo đã đọc", updated));
    }

    // ==================== Xóa thông báo ====================

    /**
     * Xóa một thông báo
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Xóa thông báo")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        log.info("DELETE /api/v1/notifications/{} for userId={}", id, userId);
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Xóa thông báo thành công", null));
    }

    /**
     * Xóa tất cả thông báo đã đọc
     */
    @DeleteMapping("/user/{userId}/read")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    @Operation(summary = "Xóa tất cả thông báo đã đọc")
    public ResponseEntity<ApiResponse<Integer>> deleteAllRead(@PathVariable Long userId) {
        int deleted = notificationService.deleteAllRead(userId);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa " + deleted + " thông báo", deleted));
    }

    // ==================== Thống kê ====================

    /**
     * Thống kê thông báo theo loại
     */
    @GetMapping("/user/{userId}/stats")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    @Operation(summary = "Thống kê thông báo")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats(@PathVariable Long userId) {
        Map<String, Long> stats = notificationService.getNotificationStats(userId);
        return ResponseEntity.ok(ApiResponse.success("OK", stats));
    }
}
