<<<<<<< Updated upstream:backend/src/main/java/com/bicap/backend/controller/SeasonController.java
package com.bicap.backend.controller;

import com.bicap.backend.dto.request.CreateSeasonRequest;
import com.bicap.backend.dto.request.UpdateSeasonRequest;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.dto.response.SeasonResponse;
import com.bicap.backend.security.SecurityUtils;
import com.bicap.backend.service.SeasonService;
=======
package com.bicap.modules.season.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.season.dto.*;
import com.bicap.modules.season.service.SeasonService;
import com.bicap.core.security.SecurityUtils;
>>>>>>> Stashed changes:backend/src/main/java/com/bicap/modules/season/controller/SeasonController.java
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
    public ApiResponse<SeasonResponse> createSeason(@Valid @RequestBody CreateSeasonRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success("Tạo mùa vụ thành công", seasonService.createSeason(request, currentUserId));
    }

    @PutMapping("/{id}")
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

    @GetMapping
    public ApiResponse<List<SeasonResponse>> getAll() {
        return ApiResponse.success(seasonService.getAllSeasons());
    }
}
