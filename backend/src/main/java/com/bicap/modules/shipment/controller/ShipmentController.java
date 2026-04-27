package com.bicap.modules.shipment.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.shipment.dto.*;
import com.bicap.modules.shipment.service.ShipmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shipments")
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @PostMapping
    @PreAuthorize("hasRole('SHIPPING_MANAGER')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> create(@Valid @RequestBody CreateShipmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tạo shipment thành công", shipmentService.create(request)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<List<ShipmentResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(shipmentService.getAll()));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponse<List<ShipmentResponse>>> getMyShipments() {
        return ResponseEntity.ok(ApiResponse.success(shipmentService.getMyShipments()));
    }

    @GetMapping("/farm")
    @PreAuthorize("hasRole('FARM')")
    public ResponseEntity<ApiResponse<List<ShipmentResponse>>> getFarmShipments() {
        return ResponseEntity.ok(ApiResponse.success(shipmentService.getFarmShipments()));
    }

    @GetMapping("/retailer")
    @PreAuthorize("hasRole('RETAILER')")
    public ResponseEntity<ApiResponse<List<ShipmentResponse>>> getRetailerShipments() {
        return ResponseEntity.ok(ApiResponse.success(shipmentService.getRetailerShipments()));
    }

    @GetMapping("/eligible-orders")
    @PreAuthorize("hasRole('SHIPPING_MANAGER')")
    public ResponseEntity<ApiResponse<List<ShipmentResponse>>> getEligibleOrders() {
        return ResponseEntity.ok(ApiResponse.success(shipmentService.getEligibleOrdersForShipment()));
    }

    @GetMapping("/reports")
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<List<ShipmentReportResponse>>> getReportsForReview() {
        return ResponseEntity.ok(ApiResponse.success(shipmentService.getReportsForReview()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER','DRIVER','FARM','RETAILER','ADMIN')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(shipmentService.getById(id)));
    }

    @PatchMapping("/{shipmentId}/status")
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> updateStatus(@PathVariable Long shipmentId,
                                                                      @Valid @RequestBody UpdateShipmentStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật shipment thành công", shipmentService.updateStatus(shipmentId, request)));
    }

    @PostMapping("/{id}/pickup")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> confirmPickup(@PathVariable Long id,
                                                                       @Valid @RequestBody ConfirmPickupRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã xác nhận pickup hàng từ farm", shipmentService.confirmPickup(id, request)));
    }

    @PostMapping("/{id}/checkpoints")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> addCheckpoint(@PathVariable Long id,
                                                                       @Valid @RequestBody AddShipmentLogRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã thêm checkpoint vận chuyển", shipmentService.addCheckpoint(id, request)));
    }

    @PostMapping("/{id}/handover")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> confirmHandover(@PathVariable Long id,
                                                                         @Valid @RequestBody UpdateShipmentStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã xác nhận bàn giao hàng cho retailer", shipmentService.confirmHandover(id, request)));
    }

    @PostMapping("/{id}/reports")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponse<Void>> reportIssue(@PathVariable Long id,
                                                         @Valid @RequestBody CreateShipmentReportRequest request) {
        shipmentService.reportIssue(id, request);
        return ResponseEntity.ok(ApiResponse.success("Đã gửi báo cáo sự cố cho manager", null));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('RETAILER')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> retailerRejectDelivery(@PathVariable Long id,
                                                                                @RequestParam String reason) {
        return ResponseEntity.ok(ApiResponse.success("Đã ghi nhận retailer reject delivery", shipmentService.retailerRejectDelivery(id, reason)));
    }

    @PostMapping("/{id}/escalate")
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> escalateIssue(@PathVariable Long id,
                                                                      @RequestParam String reason) {
        return ResponseEntity.ok(ApiResponse.success("Đã escalated shipment issue", shipmentService.escalateIssue(id, reason)));
    }
}
