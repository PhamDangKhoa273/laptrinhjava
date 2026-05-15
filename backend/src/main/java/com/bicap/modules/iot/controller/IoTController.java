package com.bicap.modules.iot.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.iot.dto.CreateSensorReadingRequest;
import com.bicap.modules.iot.dto.SensorAlertResponse;
import com.bicap.modules.iot.dto.ThresholdRuleRequest;
import com.bicap.modules.iot.dto.ThresholdRuleResponse;
import com.bicap.modules.iot.service.IoTService;
import com.bicap.modules.iot.service.ThresholdRuleService;
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
    private final ThresholdRuleService thresholdRuleService;

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

    // ── Threshold Rules ──────────────────────────────────────────────────────

    @GetMapping("/thresholds")
    @PreAuthorize("hasRole('FARM')")
    public ApiResponse<List<ThresholdRuleResponse>> getMyThresholds() {
        return ApiResponse.success(thresholdRuleService.getMyThresholds());
    }

    @PostMapping("/thresholds")
    @PreAuthorize("hasRole('FARM')")
    public ApiResponse<ThresholdRuleResponse> createThreshold(@Valid @RequestBody ThresholdRuleRequest request) {
        return ApiResponse.success("Tạo ngưỡng cảnh báo thành công", thresholdRuleService.create(request));
    }

    @PutMapping("/thresholds/{id}")
    @PreAuthorize("hasRole('FARM')")
    public ApiResponse<ThresholdRuleResponse> updateThreshold(@PathVariable Long id, @Valid @RequestBody ThresholdRuleRequest request) {
        return ApiResponse.success("Cập nhật ngưỡng cảnh báo thành công", thresholdRuleService.update(id, request));
    }

    @DeleteMapping("/thresholds/{id}")
    @PreAuthorize("hasRole('FARM')")
    public ApiResponse<Void> deleteThreshold(@PathVariable Long id) {
        thresholdRuleService.delete(id);
        return ApiResponse.success(null);
    }
}
