package com.bicap.backend.controller;

import com.bicap.backend.dto.request.CreateSeasonRequest;
import com.bicap.backend.dto.request.UpdateSeasonRequest;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.dto.response.SeasonResponse;
import com.bicap.backend.security.SecurityUtils;
import com.bicap.backend.service.SeasonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seasons")
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
