package com.bicap.backend.controller;

<<<<<<< HEAD:src/main/java/com/bicap/backend/controller/FarmingSeasonController.java
import com.bicap.backend.dto.request.FarmingSeasonRequest;
=======
import com.bicap.backend.dto.request.CreateSeasonRequest;
import com.bicap.backend.dto.request.UpdateSeasonRequest;
>>>>>>> d2684be:backend/src/main/java/com/bicap/backend/controller/FarmingSeasonController.java
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.dto.response.FarmingSeasonResponse;
import com.bicap.backend.security.SecurityUtils;
import com.bicap.backend.service.FarmingSeasonService;
import jakarta.validation.Valid;
<<<<<<< HEAD:src/main/java/com/bicap/backend/controller/FarmingSeasonController.java
import lombok.RequiredArgsConstructor;
=======
>>>>>>> d2684be:backend/src/main/java/com/bicap/backend/controller/FarmingSeasonController.java
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
<<<<<<< HEAD:src/main/java/com/bicap/backend/controller/FarmingSeasonController.java
@RequestMapping("/api/farming-seasons")
@RequiredArgsConstructor
=======
@RequestMapping("/api/seasons")
>>>>>>> d2684be:backend/src/main/java/com/bicap/backend/controller/FarmingSeasonController.java
public class FarmingSeasonController {

    private final FarmingSeasonService farmingSeasonService;

<<<<<<< HEAD:src/main/java/com/bicap/backend/controller/FarmingSeasonController.java
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
=======
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
>>>>>>> d2684be:backend/src/main/java/com/bicap/backend/controller/FarmingSeasonController.java
    }

    @GetMapping("/{id}")
    public ApiResponse<FarmingSeasonResponse> getSeasonById(@PathVariable Long id) {
<<<<<<< HEAD:src/main/java/com/bicap/backend/controller/FarmingSeasonController.java
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
=======
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
>>>>>>> d2684be:backend/src/main/java/com/bicap/backend/controller/FarmingSeasonController.java
    }
}
