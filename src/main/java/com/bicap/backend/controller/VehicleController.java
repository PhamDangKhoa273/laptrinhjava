package com.bicap.backend.controller;

import com.bicap.backend.dto.CreateVehicleRequest;
import com.bicap.backend.dto.UpdateVehicleRequest;
import com.bicap.backend.dto.VehicleResponse;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.security.SecurityUtils;
import com.bicap.backend.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER','ADMIN')")
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
}