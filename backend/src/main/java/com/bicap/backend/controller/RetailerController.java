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
    @PreAuthorize("hasRole('RETAILER')")
    public ApiResponse<RetailerResponse> create(@Valid @RequestBody CreateRetailerRequest request) {
        return ApiResponse.success(
                "Táº¡o retailer thÃ nh cÃ´ng",
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
                "Cáº­p nháº­t retailer thÃ nh cÃ´ng",
                retailerService.update(id, request, SecurityUtils.getCurrentUserId())
        );
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN','RETAILER')")
    public ApiResponse<RetailerResponse> deactivate(@PathVariable Long id) {
        return ApiResponse.success(
                "Ngá»«ng kÃ­ch hoáº¡t retailer thÃ nh cÃ´ng",
                retailerService.deactivate(id, SecurityUtils.getCurrentUserId())
        );
    }
}
