package com.bicap.modules.shipment.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.shipment.dto.CreateShipmentRequest;
import com.bicap.modules.shipment.dto.ShipmentResponse;
import com.bicap.modules.shipment.dto.UpdateShipmentStatusRequest;
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
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER','DRIVER','ADMIN')")
    public ResponseEntity<ApiResponse<List<ShipmentResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(shipmentService.getAll()));
    }

    @PatchMapping("/{shipmentId}/status")
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER','DRIVER')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> updateStatus(@PathVariable Long shipmentId,
                                                                      @Valid @RequestBody UpdateShipmentStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật shipment thành công", shipmentService.updateStatus(shipmentId, request)));
    }
}
