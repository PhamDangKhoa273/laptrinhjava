package com.bicap.backend.controller;

import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.entity.Vehicle;
import com.bicap.backend.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    public ApiResponse<Vehicle> createVehicle(@RequestBody Vehicle vehicle,
                                              @RequestParam Long managerUserId) {
        return ApiResponse.success("Tạo vehicle thành công",
                vehicleService.createVehicle(vehicle, managerUserId));
    }

    @GetMapping
    public ApiResponse<?> getAll() {
        return ApiResponse.success(vehicleService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<Vehicle> getById(@PathVariable Long id) {
        return ApiResponse.success(vehicleService.getById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<Vehicle> update(@PathVariable Long id,
                                       @RequestBody Vehicle vehicle,
                                       @RequestParam Long managerUserId) {
        return ApiResponse.success("Cập nhật vehicle thành công",
                vehicleService.update(id, vehicle, managerUserId));
    }
}