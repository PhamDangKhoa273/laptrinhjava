package com.bicap.modules.season.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.season.dto.SeasonExportResponse;
import com.bicap.modules.season.service.SeasonExportService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/seasons")
@RequiredArgsConstructor
public class SeasonExportController {

    private final SeasonExportService seasonExportService;

    @PostMapping("/{id}/export")
    @PreAuthorize("hasAnyRole('ADMIN','FARM')")
    public ApiResponse<SeasonExportResponse> exportSeason(@PathVariable Long id) {
        return ApiResponse.success("Export mùa vụ thành công", seasonExportService.exportSeason(id));
    }

    @GetMapping("/{id}/export/latest")
    public ApiResponse<SeasonExportResponse> latest(@PathVariable Long id) {
        return ApiResponse.success(seasonExportService.getLatestExport(id));
    }

    @GetMapping("/public/export")
    public ApiResponse<SeasonExportResponse> getByTrace(@RequestParam @NotBlank String traceCode) {
        return ApiResponse.success(seasonExportService.getByTraceCode(traceCode));
    }
}
