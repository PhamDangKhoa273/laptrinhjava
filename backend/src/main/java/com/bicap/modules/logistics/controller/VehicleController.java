package com.bicap.modules.logistics.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.logistics.dto.CreateVehicleRequest;
import com.bicap.modules.logistics.dto.UpdateVehicleRequest;
import com.bicap.modules.logistics.dto.VehicleResponse;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.logistics.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    @PreAuthorize("hasRole('SHIPPING_MANAGER')")
    public ApiResponse<VehicleResponse> createVehicle(@Valid @RequestBody CreateVehicleRequest request) {
        return ApiResponse.success(
                "Tạo vehicle thành công",
                vehicleService.createVehicle(request, SecurityUtils.getCurrentUserId())
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER','ADMIN')")
    public ApiResponse<List<VehicleResponse>> getAll() {
        return ApiResponse.success(vehicleService.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER','ADMIN')")
    public ApiResponse<VehicleResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(vehicleService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER','ADMIN')")
    public ApiResponse<VehicleResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody UpdateVehicleRequest request) {
        return ApiResponse.success(
                "Cập nhật vehicle thành công",
                vehicleService.update(id, request, SecurityUtils.getCurrentUserId())
        );
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER','ADMIN')")
    public ApiResponse<VehicleResponse> deactivate(@PathVariable Long id) {
        return ApiResponse.success(
                "Ngừng kích hoạt vehicle thành công",
                vehicleService.deactivate(id, SecurityUtils.getCurrentUserId())
        );
    }
}
