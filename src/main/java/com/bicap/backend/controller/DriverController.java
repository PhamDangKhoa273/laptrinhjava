package com.bicap.backend.controller;

import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.entity.Driver;
import com.bicap.backend.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @PostMapping
    public ApiResponse<Driver> create(@RequestBody Driver driver,
                                      @RequestParam Long userId,
                                      @RequestParam Long managerId) {
        return ApiResponse.success(driverService.create(driver, userId, managerId));
    }

    @GetMapping
    public ApiResponse<?> getAll() {
        return ApiResponse.success(driverService.getAll());
    }
}