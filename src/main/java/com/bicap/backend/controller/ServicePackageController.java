package com.bicap.backend.controller;

import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.entity.ServicePackage;
import com.bicap.backend.service.ServicePackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
public class ServicePackageController {

    private final ServicePackageService service;

    @PostMapping
    public ApiResponse<ServicePackage> create(@RequestBody ServicePackage p) {
        return ApiResponse.success(service.create(p));
    }

    @GetMapping
    public ApiResponse<?> getAll() {
        return ApiResponse.success(service.getAll());
    }
}