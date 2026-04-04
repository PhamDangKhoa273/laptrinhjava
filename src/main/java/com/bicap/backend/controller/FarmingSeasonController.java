package com.bicap.backend.controller;

import com.bicap.backend.dto.request.FarmingSeasonRequest;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.dto.response.FarmingSeasonResponse;
import com.bicap.backend.security.SecurityUtils;
import com.bicap.backend.service.FarmingSeasonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farming-seasons")
@RequiredArgsConstructor
public class FarmingSeasonController {

    private final FarmingSeasonService farmingSeasonService;

    @PostMapping
    public ApiResponse<FarmingSeasonResponse> createSeason(@RequestBody @Valid FarmingSeasonRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        FarmingSeasonResponse response = farmingSeasonService.createSeason(request, currentUserId);
        return ApiResponse.success(response);
    }

    @PutMapping("/{id}")
    public ApiResponse<FarmingSeasonResponse> updateSeason(@PathVariable Long id, @RequestBody @Valid FarmingSeasonRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        FarmingSeasonResponse response = farmingSeasonService.updateSeason(id, request, currentUserId);
        return ApiResponse.success(response);
    }

    @GetMapping("/{id}")
    public ApiResponse<FarmingSeasonResponse> getSeasonById(@PathVariable Long id) {
        FarmingSeasonResponse response = farmingSeasonService.getSeasonById(id);
        return ApiResponse.success(response);
    }

    @GetMapping
    public ApiResponse<List<FarmingSeasonResponse>> getSeasons(@RequestParam(required = false) Long farmId) {
        List<FarmingSeasonResponse> responses;
        if (farmId != null) {
            responses = farmingSeasonService.getSeasonsByFarmId(farmId);
        } else {
            responses = farmingSeasonService.getAllSeasons();
        }
        return ApiResponse.success(responses);
    }
}
