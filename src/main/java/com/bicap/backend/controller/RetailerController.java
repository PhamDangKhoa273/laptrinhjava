package com.bicap.backend.controller;

import com.bicap.backend.dto.CreateRetailerRequest;
import com.bicap.backend.dto.RetailerResponse;
import com.bicap.backend.dto.UpdateRetailerRequest;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.security.SecurityUtils;
import com.bicap.backend.service.RetailerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/retailers")
@RequiredArgsConstructor
public class RetailerController {

    private final RetailerService retailerService;

    @PostMapping
    @PreAuthorize("hasAnyRole('RETAILER','ADMIN')")
    public ApiResponse<RetailerResponse> create(@Valid @RequestBody CreateRetailerRequest request) {
        return ApiResponse.success(
                "Tạo retailer thành công",
                retailerService.create(request, SecurityUtils.getCurrentUserId())
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<RetailerResponse>> getAll() {
        return ApiResponse.success(retailerService.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RETAILER')")
    public ApiResponse<RetailerResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(retailerService.getById(id, SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN','RETAILER')")
    public ApiResponse<RetailerResponse> getMyRetailer() {
        return ApiResponse.success(retailerService.getMyRetailer(SecurityUtils.getCurrentUserId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RETAILER')")
    public ApiResponse<RetailerResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody UpdateRetailerRequest request) {
        return ApiResponse.success(
                "Cập nhật retailer thành công",
                retailerService.update(id, request, SecurityUtils.getCurrentUserId())
        );
    }
}