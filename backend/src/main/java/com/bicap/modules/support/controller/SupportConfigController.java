package com.bicap.modules.support.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.support.dto.SupportConfigRequest;
import com.bicap.modules.support.dto.SupportConfigResponse;
import com.bicap.modules.support.service.SupportConfigService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:3000")
public class SupportConfigController {

    private final SupportConfigService supportConfigService;

    public SupportConfigController(SupportConfigService supportConfigService) {
        this.supportConfigService = supportConfigService;
    }

    @GetMapping("/public/support-config")
    public ApiResponse<SupportConfigResponse> getPublic() {
        return ApiResponse.success(supportConfigService.get());
    }

    @GetMapping("/admin/support-config")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<SupportConfigResponse> getForAdmin() {
        return ApiResponse.success(supportConfigService.get());
    }

    @PutMapping("/admin/support-config")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<SupportConfigResponse> update(@Valid @RequestBody SupportConfigRequest request) {
        return ApiResponse.success("Da luu cau hinh ho tro", supportConfigService.update(request));
    }
}
