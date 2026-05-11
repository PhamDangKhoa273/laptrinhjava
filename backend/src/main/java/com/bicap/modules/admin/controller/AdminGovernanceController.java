package com.bicap.modules.admin.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.admin.service.AdminGovernanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/governance")
@RequiredArgsConstructor
public class AdminGovernanceController {

    private final AdminGovernanceService adminGovernanceService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Map<String, Object>> overview() {
        return ApiResponse.success(adminGovernanceService.getOverview());
    }
}
