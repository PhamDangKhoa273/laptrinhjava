package com.bicap.backend.controller;

import com.bicap.backend.dto.request.CreateProcessStepRequest;
import com.bicap.backend.dto.request.ReorderProcessRequest;
import com.bicap.backend.dto.request.UpdateProcessStepRequest;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.dto.response.ProcessStepResponse;
import com.bicap.backend.dto.response.ProcessTimelineResponse;
import com.bicap.backend.service.FarmingProcessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FarmingProcessController {

    private final FarmingProcessService farmingProcessService;

    @PostMapping("/seasons/{seasonId}/processes")
    public ApiResponse<ProcessStepResponse> createProcessStep(
            @PathVariable Long seasonId,
            @Valid @RequestBody CreateProcessStepRequest request) {
        ProcessStepResponse response = farmingProcessService.createProcessStep(seasonId, request);
        return ApiResponse.success("ThÃªm bÆ°á»›c quy trÃ¬nh thÃ nh cÃ´ng", response);
    }

    @GetMapping("/seasons/{seasonId}/processes")
    public ApiResponse<ProcessTimelineResponse> getProcessesBySeason(@PathVariable Long seasonId) {
        ProcessTimelineResponse response = farmingProcessService.getProcessesBySeason(seasonId);
        return ApiResponse.success("Láº¥y danh sÃ¡ch quy trÃ¬nh thÃ nh cÃ´ng", response);
    }

    @GetMapping("/processes/{id}")
    public ApiResponse<ProcessStepResponse> getProcessDetail(@PathVariable Long id) {
        ProcessStepResponse response = farmingProcessService.getProcessDetail(id);
        return ApiResponse.success("Láº¥y chi tiáº¿t bÆ°á»›c quy trÃ¬nh thÃ nh cÃ´ng", response);
    }

    @PutMapping("/processes/{id}")
    public ApiResponse<ProcessStepResponse> updateProcessStep(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProcessStepRequest request) {
        ProcessStepResponse response = farmingProcessService.updateProcessStep(id, request);
        return ApiResponse.success("Cáº­p nháº­t bÆ°á»›c quy trÃ¬nh thÃ nh cÃ´ng", response);
    }

    @DeleteMapping("/processes/{id}")
    public ApiResponse<Void> deleteProcessStep(@PathVariable Long id) {
        farmingProcessService.deleteProcessStep(id);
        return ApiResponse.success("XÃ³a bÆ°á»›c quy trÃ¬nh thÃ nh cÃ´ng", null);
    }

    @PatchMapping("/processes/{id}/reorder")
    public ApiResponse<ProcessStepResponse> reorderProcessStep(
            @PathVariable Long id,
            @RequestParam("stepNo") Integer stepNo) {
        ProcessStepResponse response = farmingProcessService.reorderProcessStep(id, stepNo);
        return ApiResponse.success("Cáº­p nháº­t thá»© tá»± bÆ°á»›c thÃ nh cÃ´ng", response);
    }

    @PatchMapping("/seasons/{seasonId}/processes/reorder")
    public ApiResponse<Void> reorderProcesses(
            @PathVariable Long seasonId,
            @Valid @RequestBody ReorderProcessRequest request) {
        farmingProcessService.reorderProcesses(seasonId, request);
        return ApiResponse.success("Cáº­p nháº­t thá»© tá»± thÃ nh cÃ´ng", null);
    }
}
