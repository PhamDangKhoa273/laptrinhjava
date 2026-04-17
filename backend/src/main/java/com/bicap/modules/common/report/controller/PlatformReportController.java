package com.bicap.modules.common.report.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.common.report.dto.CreatePlatformReportRequest;
import com.bicap.modules.common.report.dto.PlatformReportResponse;
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
}
