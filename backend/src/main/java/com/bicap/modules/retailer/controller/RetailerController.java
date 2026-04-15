package com.bicap.modules.retailer.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.retailer.dto.CreateRetailerRequest;
import com.bicap.modules.retailer.dto.RetailerResponse;
import com.bicap.modules.retailer.dto.UpdateRetailerRequest;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.retailer.service.RetailerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/v1/retailers")
@RequiredArgsConstructor
public class RetailerController {

    private final RetailerService retailerService;

    @PostMapping
    @PreAuthorize("hasRole('RETAILER')")
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
    @PreAuthorize("hasRole('RETAILER')")
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

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN','RETAILER')")
    public ApiResponse<RetailerResponse> deactivate(@PathVariable Long id) {
        return ApiResponse.success(
                "Ngừng kích hoạt retailer thành công",
                retailerService.deactivate(id, SecurityUtils.getCurrentUserId())
        );
    }
}
