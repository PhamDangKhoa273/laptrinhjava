package com.bicap.modules.iot.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.iot.dto.CreateSensorReadingRequest;
import com.bicap.modules.iot.dto.SensorAlertResponse;
import com.bicap.modules.iot.service.IoTService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/iot")
@RequiredArgsConstructor
public class IoTController {
    private final IoTService iotService;

    @PostMapping("/readings")
    @PreAuthorize("hasAnyRole('FARM','ADMIN')")
    public ApiResponse<SensorAlertResponse> ingest(@Valid @RequestBody CreateSensorReadingRequest request) {
        return ApiResponse.success(iotService.ingest(request));
    }

    @GetMapping("/alerts/me")
    @PreAuthorize("hasRole('FARM')")
    public ApiResponse<List<SensorAlertResponse>> getMyAlerts() {
        return ApiResponse.success(iotService.getMyAlerts());
    }

    @PatchMapping("/alerts/{id}/resolve")
    @PreAuthorize("hasRole('FARM')")
    public ApiResponse<SensorAlertResponse> resolve(@PathVariable Long id) {
        return ApiResponse.success(iotService.resolve(id));
    }
}
