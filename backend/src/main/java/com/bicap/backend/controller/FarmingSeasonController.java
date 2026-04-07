package com.bicap.backend.controller;

import com.bicap.backend.dto.request.CreateSeasonRequest;
import com.bicap.backend.dto.request.UpdateSeasonRequest;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.dto.response.FarmingSeasonResponse;
import com.bicap.backend.security.SecurityUtils;
import com.bicap.backend.service.FarmingSeasonService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seasons")
public class FarmingSeasonController {

    private final FarmingSeasonService farmingSeasonService;

    // Manual Constructor instead of @RequiredArgsConstructor
    public FarmingSeasonController(FarmingSeasonService farmingSeasonService) {
        this.farmingSeasonService = farmingSeasonService;
    }

    @PostMapping
    public ApiResponse<FarmingSeasonResponse> createSeason(@RequestBody @Valid CreateSeasonRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success(farmingSeasonService.createSeason(request, currentUserId));
    }

    @PutMapping("/{id}")
    public ApiResponse<FarmingSeasonResponse> updateSeason(
            @PathVariable Long id, 
            @RequestBody @Valid UpdateSeasonRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success(farmingSeasonService.updateSeason(id, request, currentUserId));
    }

    @GetMapping("/{id}")
    public ApiResponse<FarmingSeasonResponse> getSeasonById(@PathVariable Long id) {
        return ApiResponse.success(farmingSeasonService.getSeasonById(id));
    }

    @GetMapping
    public ApiResponse<List<FarmingSeasonResponse>> getAllSeasons() {
        return ApiResponse.success(farmingSeasonService.getAllSeasons());
    }

    @GetMapping("/farm/{farmId}")
    public ApiResponse<List<FarmingSeasonResponse>> getSeasonsByFarm(@PathVariable Long farmId) {
        return ApiResponse.success(farmingSeasonService.getSeasonsByFarmId(farmId));
    }

    @GetMapping("/product/{productId}")
    public ApiResponse<List<FarmingSeasonResponse>> getSeasonsByProduct(@PathVariable Long productId) {
        return ApiResponse.success(farmingSeasonService.getSeasonsByProductId(productId));
    }
}
