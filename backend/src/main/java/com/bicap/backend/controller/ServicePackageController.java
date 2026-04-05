package com.bicap.backend.controller;

import com.bicap.backend.dto.CreateServicePackageRequest;
import com.bicap.backend.dto.ServicePackageResponse;
import com.bicap.backend.dto.UpdateServicePackageRequest;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.service.ServicePackageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
public class ServicePackageController {

    private final ServicePackageService service;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ServicePackageResponse> create(@Valid @RequestBody CreateServicePackageRequest request) {
        return ApiResponse.success("Tạo gói dịch vụ thành công", service.create(request));
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
        return ApiResponse.success("Cập nhật gói dịch vụ thành công", service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success("Xóa gói dịch vụ thành công", null);
    }
}

