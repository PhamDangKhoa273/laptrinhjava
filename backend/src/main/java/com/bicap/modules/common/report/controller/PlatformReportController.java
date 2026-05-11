package com.bicap.modules.common.report.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.common.report.dto.CreatePlatformReportRequest;
import com.bicap.modules.common.report.dto.PlatformReportResponse;
import com.bicap.modules.common.report.dto.UpdatePlatformReportStatusRequest;
import com.bicap.modules.common.report.service.PlatformReportService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@CrossOrigin(origins = "http://localhost:3000")
public class PlatformReportController {

    private final PlatformReportService platformReportService;

    public PlatformReportController(PlatformReportService platformReportService) {
        this.platformReportService = platformReportService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PlatformReportResponse> create(@Valid @RequestBody CreatePlatformReportRequest request) {
        return ApiResponse.success("Gửi báo cáo thành công", platformReportService.create(request));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<PlatformReportResponse>> getMyReports() {
        return ApiResponse.success(platformReportService.getMyReports());
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<PlatformReportResponse>> getAdminReports() {
        return ApiResponse.success(platformReportService.getAdminReports());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PlatformReportResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody UpdatePlatformReportStatusRequest request) {
        return ApiResponse.success("Cập nhật trạng thái report thành công", platformReportService.updateStatus(id, request));
    }
}
