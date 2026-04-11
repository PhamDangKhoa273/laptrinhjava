package com.bicap.modules.season.controller;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.season.service.SeasonService;

import com.bicap.modules.user.entity.User;

import com.bicap.core.dto.ApiResponse;

import com.bicap.modules.season.dto.CreateSeasonRequest;
import com.bicap.modules.season.dto.UpdateSeasonRequest;
import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.season.dto.SeasonResponse;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.season.service.SeasonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/seasons")
@RequiredArgsConstructor
public class SeasonController {

    private final SeasonService seasonService;

    @PostMapping
    public ApiResponse<SeasonResponse> createSeason(@RequestBody @Valid CreateSeasonRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success(seasonService.createSeason(request, currentUserId));
    }

    @PutMapping("/{id}")
    public ApiResponse<SeasonResponse> updateSeason(
            @PathVariable Long id, 
            @RequestBody @Valid UpdateSeasonRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success(seasonService.updateSeason(id, request, currentUserId));
    }

    @GetMapping("/{id}")
    public ApiResponse<SeasonResponse> getSeasonById(@PathVariable Long id) {
        return ApiResponse.success(seasonService.getSeasonById(id));
    }

    @GetMapping
    public ApiResponse<List<SeasonResponse>> getSeasons(@RequestParam(required = false) Long farmId) {
        if (farmId != null) {
            return ApiResponse.success(seasonService.getSeasonsByFarmId(farmId));
        }
        return ApiResponse.success(seasonService.getAllSeasons());
    }
}
