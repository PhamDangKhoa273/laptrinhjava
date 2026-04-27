package com.bicap.modules.season.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.season.dto.CreateSeasonRequest;
import com.bicap.modules.season.dto.SeasonResponse;
import com.bicap.modules.season.dto.UpdateSeasonRequest;
import com.bicap.modules.season.service.SeasonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/v1/seasons")
@RequiredArgsConstructor
public class SeasonController {

    private final SeasonService seasonService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','FARM')")
    public ApiResponse<SeasonResponse> createSeason(@Valid @RequestBody CreateSeasonRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success("Tạo mùa vụ thành công", seasonService.createSeason(request, currentUserId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FARM')")
    public ApiResponse<SeasonResponse> updateSeason(@PathVariable Long id, 
                                                    @Valid @RequestBody UpdateSeasonRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success("Cập nhật mùa vụ thành công", seasonService.updateSeason(id, request, currentUserId));
    }

    @GetMapping("/{id}")
    public ApiResponse<SeasonResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(seasonService.getSeasonById(id));
    }

    @GetMapping("/farm/{farmId}")
    public ApiResponse<List<SeasonResponse>> getByFarm(@PathVariable Long farmId) {
        return ApiResponse.success(seasonService.getSeasonsByFarmId(farmId));
    }

    @GetMapping("/product/{productId}")
    public ApiResponse<List<SeasonResponse>> getByProduct(@PathVariable Long productId) {
        return ApiResponse.success(seasonService.getSeasonsByProductId(productId));
    }

    @GetMapping("/by-farm/{farmId}")
    public ApiResponse<List<SeasonResponse>> getByFarmAlias(@PathVariable Long farmId) {
        return ApiResponse.success(seasonService.getSeasonsByFarmId(farmId));
    }

    @GetMapping("/by-product/{productId}")
    public ApiResponse<List<SeasonResponse>> getByProductAlias(@PathVariable Long productId) {
        return ApiResponse.success(seasonService.getSeasonsByProductId(productId));
    }

    @GetMapping
    public ApiResponse<List<SeasonResponse>> getAll() {
        return ApiResponse.success(seasonService.getAllSeasons());
    }
}
