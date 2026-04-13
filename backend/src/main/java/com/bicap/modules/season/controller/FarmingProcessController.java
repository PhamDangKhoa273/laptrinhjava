package com.bicap.modules.season.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.season.dto.CreateProcessStepRequest;
import com.bicap.modules.season.dto.ProcessStepResponse;
import com.bicap.modules.season.dto.ProcessTimelineResponse;
import com.bicap.modules.season.dto.ReorderProcessRequest;
import com.bicap.modules.season.dto.UpdateProcessStepRequest;
import com.bicap.modules.season.service.FarmingProcessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/processes")
@RequiredArgsConstructor
public class FarmingProcessController {

    private final FarmingProcessService farmingProcessService;

    @PostMapping("/season/{seasonId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','FARM')")
    public ApiResponse<ProcessStepResponse> createStep(@PathVariable Long seasonId, 
                                                       @Valid @RequestBody CreateProcessStepRequest request) {
        ProcessStepResponse response = farmingProcessService.createProcessStep(seasonId, request);
        return ApiResponse.success("Ghi nhận bước quy trình thành công", response);
    }

    @PostMapping("/seasons/{seasonId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','FARM')")
    public ApiResponse<ProcessStepResponse> createStepAlias(@PathVariable Long seasonId,
                                                            @Valid @RequestBody CreateProcessStepRequest request) {
        ProcessStepResponse response = farmingProcessService.createProcessStep(seasonId, request);
        return ApiResponse.success("Ghi nhận bước quy trình thành công", response);
    }

    @GetMapping("/season/{seasonId}")
    public ApiResponse<ProcessTimelineResponse> getBySeason(@PathVariable Long seasonId) {
        ProcessTimelineResponse response = farmingProcessService.getProcessesBySeason(seasonId);
        return ApiResponse.success(response);
    }

    @GetMapping("/seasons/{seasonId}")
    public ApiResponse<ProcessTimelineResponse> getBySeasonAlias(@PathVariable Long seasonId) {
        ProcessTimelineResponse response = farmingProcessService.getProcessesBySeason(seasonId);
        return ApiResponse.success(response);
    }

    @GetMapping("/{id}")
    public ApiResponse<ProcessStepResponse> getDetail(@PathVariable Long id) {
        ProcessStepResponse response = farmingProcessService.getProcessDetail(id);
        return ApiResponse.success(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','FARM')")
    public ApiResponse<ProcessStepResponse> updateStep(@PathVariable Long id, 
                                                       @Valid @RequestBody UpdateProcessStepRequest request) {
        ProcessStepResponse response = farmingProcessService.updateProcessStep(id, request);
        return ApiResponse.success("Cập nhật bước quy trình thành công", response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','FARM')")
    public ApiResponse<Void> deleteStep(@PathVariable Long id) {
        farmingProcessService.deleteProcessStep(id);
        return ApiResponse.success("Xóa bước quy trình thành công", null);
    }

    @PatchMapping("/{id}/reorder")
    @PreAuthorize("hasAnyAuthority('ADMIN','FARM')")
    public ApiResponse<ProcessStepResponse> reorderStep(@PathVariable Long id, @RequestParam Integer stepNo) {
        ProcessStepResponse response = farmingProcessService.reorderProcessStep(id, stepNo);
        return ApiResponse.success("Thay đổi thứ tự thành công", response);
    }

    @PostMapping("/season/{seasonId}/reorder")
    @PreAuthorize("hasAnyAuthority('ADMIN','FARM')")
    public ApiResponse<Void> reorderAll(@PathVariable Long seasonId, @RequestBody ReorderProcessRequest request) {
        farmingProcessService.reorderProcesses(seasonId, request);
        return ApiResponse.success("Sắp xếp lại toàn bộ quy trình thành công", null);
    }
}
