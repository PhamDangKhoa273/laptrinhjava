package com.bicap.modules.analytics.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.analytics.dto.AnalyticsDashboardResponse;
import com.bicap.modules.analytics.dto.ForecastResponse;
import com.bicap.modules.analytics.service.AnalyticsService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService service;

    public AnalyticsController(AnalyticsService service) {
        this.service = service;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN','FARM','SHIPPING_MANAGER')")
    public ApiResponse<AnalyticsDashboardResponse> dashboard() {
        return ApiResponse.success(service.getDashboard());
    }

    @GetMapping("/forecast/demand")
    @PreAuthorize("hasAnyRole('ADMIN','FARM')")
    public ApiResponse<ForecastResponse> demand() {
        return ApiResponse.success(service.forecastDemand());
    }

    @GetMapping("/forecast/inventory")
    @PreAuthorize("hasAnyRole('ADMIN','FARM')")
    public ApiResponse<ForecastResponse> inventory() {
        return ApiResponse.success(service.forecastInventory());
    }

    @GetMapping("/forecast/delivery")
    @PreAuthorize("hasAnyRole('ADMIN','SHIPPING_MANAGER')")
    public ApiResponse<ForecastResponse> delivery() {
        return ApiResponse.success(service.forecastDeliveryDelay());
    }

    @GetMapping("/forecast/iot")
    @PreAuthorize("hasAnyRole('ADMIN','FARM','SHIPPING_MANAGER')")
    public ApiResponse<ForecastResponse> iot() {
        return ApiResponse.success(service.forecastIotRisk());
    }
}