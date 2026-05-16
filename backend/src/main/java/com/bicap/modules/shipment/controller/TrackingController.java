package com.bicap.modules.shipment.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.shipment.dto.LocationUpdateRequest;
import com.bicap.modules.shipment.dto.TrackingLocationResponse;
import com.bicap.modules.shipment.service.TrackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * REST API theo dõi vị trí GPS realtime của tài xế.
 */
@RestController
@RequestMapping("/api/v1/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final TrackingService trackingService;

    @PostMapping("/location/update")
    @PreAuthorize("hasRole('DRIVER')")
    public ApiResponse<TrackingLocationResponse> updateLocation(@Valid @RequestBody LocationUpdateRequest request) {
        return ApiResponse.success("Cập nhật vị trí thành công", trackingService.updateLocation(request));
    }

    @GetMapping("/shipments/{shipmentId}/latest-location")
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER','DRIVER','ADMIN')")
    public ApiResponse<TrackingLocationResponse> getLatestLocation(@PathVariable Long shipmentId) {
        return ApiResponse.success("Lấy vị trí hiện tại thành công", trackingService.getLatestLocation(shipmentId));
    }

    @GetMapping("/shipments/{shipmentId}/history")
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER','DRIVER','ADMIN')")
    public ApiResponse<List<TrackingLocationResponse>> getLocationHistory(@PathVariable Long shipmentId) {
        return ApiResponse.success("Lấy lịch sử vị trí thành công", trackingService.getLocationHistory(shipmentId));
    }

    @GetMapping("/shipments/{shipmentId}/history-range")
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER','ADMIN')")
    public ApiResponse<List<TrackingLocationResponse>> getLocationsByTimeRange(
            @PathVariable Long shipmentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        LocalDateTime start = startTime != null ? startTime : LocalDateTime.now().minusHours(24);
        LocalDateTime end = endTime != null ? endTime : LocalDateTime.now();
        return ApiResponse.success("Lấy lịch sử vị trí trong khoảng thời gian thành công",
                trackingService.getLocationsByTimeRange(shipmentId, start, end));
    }

    @GetMapping("/drivers/{driverId}/locations")
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER','ADMIN')")
    public ApiResponse<List<TrackingLocationResponse>> getDriverLocations(@PathVariable Long driverId) {
        return ApiResponse.success("Lấy vị trí tài xế thành công", trackingService.getDriverLocations(driverId));
    }
}
