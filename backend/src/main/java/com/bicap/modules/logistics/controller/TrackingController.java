package com.bicap.modules.logistics.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.logistics.dto.LocationUpdateRequest;
import com.bicap.modules.logistics.dto.TrackingLocationResponse;
import com.bicap.modules.logistics.service.TrackingService;
import com.bicap.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;

/**
 * REST API cho theo dõi vị trí GPS real-time của tài xế
 * - Cập nhật vị trí GPS hiện tại
 * - Lấy vị trí mới nhất
 * - Xem lịch sử vị trí (vẽ đường trên bản đồ)
 */
@RestController
@RequestMapping("/api/v1/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final TrackingService trackingService;

    /**
     * [DRIVER] Cập nhật vị trí GPS hiện tại
     * POST /api/v1/tracking/location/update
     * 
     * Request body:
     * {
     *   "shipmentId": 1,
     *   "latitude": 10.7769,
     *   "longitude": 106.7009,
     *   "accuracy": 5.0
     * }
     * 
     * Hệ thống sẽ:
     * 1. Lưu vào Redis (cache 1 giờ) - để lấy nhanh
     * 2. Lưu vào MySQL (lâu dài) - để phân tích và báo cáo
     * 3. Ghi vào lịch sử shipment
     */
    @PostMapping("/location/update")
    @PreAuthorize("hasRole('DRIVER')")
    public ApiResponse<TrackingLocationResponse> updateLocation(
            @Valid @RequestBody LocationUpdateRequest request) {
        Long driverId = getCurrentUserId();
        TrackingLocationResponse response = trackingService.updateLocation(request, driverId);
        return ApiResponse.success("Cập nhật vị trí thành công", response);
    }

    /**
     * [MANAGER/DRIVER] Lấy vị trí mới nhất của tài xế (cho shipment này)
     * GET /api/v1/tracking/shipments/{shipmentId}/latest-location
     * 
     * Response:
     * {
     *   "locationId": 1,
     *   "shipmentId": 1,
     *   "driverId": 5,
     *   "latitude": 10.7769,
     *   "longitude": 106.7009,
     *   "accuracy": 5.0,
     *   "createdAt": "2026-04-16T15:45:30"
     * }
     * 
     * Dùng để: Hiển thị điểm tài xế trên bản đồ real-time
     */
    @GetMapping("/shipments/{shipmentId}/latest-location")
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER', 'DRIVER')")
    public ApiResponse<TrackingLocationResponse> getLatestLocation(@PathVariable Long shipmentId) {
        TrackingLocationResponse response = trackingService.getLatestLocation(shipmentId);
        return ApiResponse.success("Lấy vị trí hiện tại thành công", response);
    }

    /**
     * [MANAGER/DRIVER] Lấy lịch sử vị trí của một shipment
     * GET /api/v1/tracking/shipments/{shipmentId}/history
     * 
     * Trả về danh sách vị trí từ mới nhất → cũ nhất
     * 
     * Dùng để: Vẽ đường đi trên bản đồ, phân tích hành trình
     */
    @GetMapping("/shipments/{shipmentId}/history")
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER', 'DRIVER')")
    public ApiResponse<List<TrackingLocationResponse>> getLocationHistory(@PathVariable Long shipmentId) {
        List<TrackingLocationResponse> history = trackingService.getLocationHistory(shipmentId);
        return ApiResponse.success("Lấy lịch sử vị trí thành công", history);
    }

    /**
     * [MANAGER] Lấy lịch sử vị trí trong khoảng thời gian
     * GET /api/v1/tracking/shipments/{shipmentId}/history-range
     * 
     * Query params:
     * - startTime: 2026-04-16T10:00:00
     * - endTime: 2026-04-16T18:00:00
     * 
     * Dùng để: Phân tích chi tiết hành trình trong khoảng thời gian
     */
    @GetMapping("/shipments/{shipmentId}/history-range")
    @PreAuthorize("hasRole('SHIPPING_MANAGER')")
    public ApiResponse<List<TrackingLocationResponse>> getLocationsByTimeRange(
            @PathVariable Long shipmentId,
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        // Nếu không có time range, lấy 24 giờ trước
        LocalDateTime start = startTime != null ? startTime : LocalDateTime.now().minusHours(24);
        LocalDateTime end = endTime != null ? endTime : LocalDateTime.now();
        
        List<TrackingLocationResponse> history = trackingService.getLocationsByTimeRange(shipmentId, start, end);
        return ApiResponse.success("Lấy lịch sử vị trí trong khoảng thời gian thành công", history);
    }

    /**
     * [MANAGER] Lấy tất cả vị trí của một tài xế
     * GET /api/v1/tracking/drivers/{driverId}/locations
     * 
     * Dùng để: Xem tất cả hành trình của tài xế, quản lý hiệu suất
     */
    @GetMapping("/drivers/{driverId}/locations")
    @PreAuthorize("hasRole('SHIPPING_MANAGER')")
    public ApiResponse<List<TrackingLocationResponse>> getDriverLocations(@PathVariable Long driverId) {
        List<TrackingLocationResponse> locations = trackingService.getDriverLocations(driverId);
        return ApiResponse.success("Lấy vị trí tài xế thành công", locations);
    }

    /**
     * Lấy ID người dùng hiện tại từ JWT token
     */
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        return user.getUserId();
    }
}
