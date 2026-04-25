package com.bicap.modules.iot.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.core.security.RateLimitService;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.iot.dto.CreateIoTReadingRequest;
import com.bicap.modules.iot.dto.IoTAlertResponse;
import com.bicap.modules.iot.dto.IoTReadingResponse;
import com.bicap.modules.iot.service.IoTService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/iot")
public class IoTController {

    private final IoTService ioTService;
    private final RateLimitService rateLimitService;

    public IoTController(IoTService ioTService, RateLimitService rateLimitService) {
        this.ioTService = ioTService;
        this.rateLimitService = rateLimitService;
    }

    @PostMapping("/readings")
    @PreAuthorize("hasAnyRole('FARM','ADMIN','SHIPPING_MANAGER')")
    public ResponseEntity<ApiResponse<IoTReadingResponse>> createReading(@Valid @RequestBody CreateIoTReadingRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        rateLimitService.check("iot:create:" + currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Ghi nhận IoT reading thành công", ioTService.createReading(request, currentUserId)));
    }

    @GetMapping("/batches/{batchId}/readings")
    @PreAuthorize("hasAnyRole('FARM','ADMIN','RETAILER','SHIPPING_MANAGER')")
    public ResponseEntity<ApiResponse<List<IoTReadingResponse>>> getReadings(@PathVariable Long batchId) {
        return ResponseEntity.ok(ApiResponse.success(ioTService.getReadings(batchId)));
    }

    @GetMapping("/batches/{batchId}/alerts")
    @PreAuthorize("hasAnyRole('FARM','ADMIN','RETAILER','SHIPPING_MANAGER')")
    public ResponseEntity<ApiResponse<List<IoTAlertResponse>>> getAlerts(@PathVariable Long batchId) {
        return ResponseEntity.ok(ApiResponse.success(ioTService.getAlerts(batchId)));
    }
}
