package com.bicap.modules.logistics.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.logistics.dto.*;
import com.bicap.modules.logistics.service.ShippingService;
import com.bicap.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * REST API cho module vận chuyển
 * - Quản lý giao đơn cho tài xế
 * - Quét QR code tại Farm (pickup) và Retailer (delivery)
 * - Xem danh sách đơn hàng của tài xế
 */
@RestController
@RequestMapping("/api/v1/shipping")
@RequiredArgsConstructor
public class ShippingController {

    private final ShippingService shippingService;

    /**
     * [MANAGER] Giao một đơn hàng cho tài xế
     * POST /api/v1/shipping/shipments/assign
     */
    @PostMapping("/shipments/assign")
    @PreAuthorize("hasRole('SHIPPING_MANAGER')")
    public ApiResponse<ShipmentResponse> assignShipment(@Valid @RequestBody AssignShipmentRequest request) {
        Long managerId = getCurrentUserId();
        ShipmentResponse response = shippingService.assignShipment(request, managerId);
        return ApiResponse.success("Giao đơn hàng thành công", response);
    }

    /**
     * [DRIVER] Quét mã QR để xác nhận pickup hoặc delivery
     * POST /api/v1/shipping/qr-scan
     * 
     * Flow:
     * 1. Tài xế tại Farm quét QR → Status: ASSIGNED → PICKED_UP
     * 2. Tài xế tại Retailer quét QR → Status: IN_TRANSIT → DELIVERED
     */
    @PostMapping("/qr-scan")
    @PreAuthorize("hasRole('DRIVER')")
    public ApiResponse<ShipmentResponse> scanQRCode(@Valid @RequestBody QRScanRequest request) {
        Long driverId = getCurrentUserId();
        ShipmentResponse response = shippingService.scanQRCode(request.getQrCodeValue(), driverId);
        return ApiResponse.success("Quét mã QR thành công", response);
    }

    /**
     * [DRIVER] Lấy danh sách tất cả đơn hàng của tài xế hiện tại
     * GET /api/v1/shipping/my-shipments
     */
    @GetMapping("/my-shipments")
    @PreAuthorize("hasRole('DRIVER')")
    public ApiResponse<List<ShipmentResponse>> getMyShipments() {
        Long driverId = getCurrentUserId();
        List<ShipmentResponse> shipments = shippingService.getMyShipments(driverId);
        return ApiResponse.success("Lấy danh sách đơn hàng thành công", shipments);
    }

    /**
     * [MANAGER/DRIVER] Lấy chi tiết một đơn vận chuyển
     * GET /api/v1/shipping/shipments/{shipmentId}
     */
    @GetMapping("/shipments/{shipmentId}")
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER', 'DRIVER')")
    public ApiResponse<ShipmentResponse> getShipment(@PathVariable Long shipmentId) {
        ShipmentResponse response = shippingService.getShipmentById(shipmentId);
        return ApiResponse.success("Lấy chi tiết đơn vận chuyển thành công", response);
    }

    /**
     * [MANAGER/DRIVER] Lấy lịch sử thay đổi trạng thái của một đơn vận chuyển
     * GET /api/v1/shipping/shipments/{shipmentId}/history
     * 
     * Trả về danh sách:
     * - Thời gian thay đổi
     * - Trạng thái cũ → mới
     * - Người thực hiện
     * - Vị trí GPS (nếu có)
     */
    @GetMapping("/shipments/{shipmentId}/history")
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER', 'DRIVER')")
    public ApiResponse<List<ShipmentHistoryResponse>> getShipmentHistory(@PathVariable Long shipmentId) {
        List<ShipmentHistoryResponse> history = shippingService.getShipmentHistory(shipmentId);
        return ApiResponse.success("Lấy lịch sử đơn vận chuyển thành công", history);
    }

    /**
     * [MANAGER] Cập nhật trạng thái đơn vận chuyển (thay đổi thủ công)
     * PATCH /api/v1/shipping/shipments/{shipmentId}/status
     */
    @PatchMapping("/shipments/{shipmentId}/status")
    @PreAuthorize("hasRole('SHIPPING_MANAGER')")
    public ApiResponse<ShipmentResponse> updateShipmentStatus(
            @PathVariable Long shipmentId,
            @Valid @RequestBody UpdateShipmentStatusRequest request) {
        Long managerId = getCurrentUserId();
        ShipmentResponse response = shippingService.updateShipmentStatus(
                shipmentId, 
                request.getNewStatus(), 
                request.getReason(), 
                managerId
        );
        return ApiResponse.success("Cập nhật trạng thái đơn vận chuyển thành công", response);
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
