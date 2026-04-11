package com.bicap.modules.subscription.controller;

import com.bicap.core.dto.ApiResponse;

import com.bicap.modules.subscription.dto.CreateServicePackageRequest;
import com.bicap.modules.subscription.dto.ServicePackageResponse;
import com.bicap.modules.subscription.dto.UpdateServicePackageRequest;
import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.subscription.service.ServicePackageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/packages")
@RequiredArgsConstructor
public class ServicePackageController {

    private final ServicePackageService service;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ServicePackageResponse> create(@Valid @RequestBody CreateServicePackageRequest request) {
        return ApiResponse.success("Táº¡o gÃ³i dá»‹ch vá»¥ thÃ nh cÃ´ng", service.create(request));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<ServicePackageResponse>> getAll() {
        return ApiResponse.success(service.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<ServicePackageResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(service.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ServicePackageResponse> update(@PathVariable Long id,
                                                      @Valid @RequestBody UpdateServicePackageRequest request) {
        return ApiResponse.success("Cáº­p nháº­t gÃ³i dá»‹ch vá»¥ thÃ nh cÃ´ng", service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success("XÃ³a gÃ³i dá»‹ch vá»¥ thÃ nh cÃ´ng", null);
    }
}

