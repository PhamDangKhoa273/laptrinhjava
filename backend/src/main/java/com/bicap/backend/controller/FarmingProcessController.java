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
        return ApiResponse.success("Thêm bước quy trình thành công", response);
    }

    @GetMapping("/seasons/{seasonId}/processes")
    public ApiResponse<ProcessTimelineResponse> getProcessesBySeason(@PathVariable Long seasonId) {
        ProcessTimelineResponse response = farmingProcessService.getProcessesBySeason(seasonId);
        return ApiResponse.success("Lấy danh sách quy trình thành công", response);
    }

    @GetMapping("/processes/{id}")
    public ApiResponse<ProcessStepResponse> getProcessDetail(@PathVariable Long id) {
        ProcessStepResponse response = farmingProcessService.getProcessDetail(id);
        return ApiResponse.success("Lấy chi tiết bước quy trình thành công", response);
    }

    @PutMapping("/processes/{id}")
    public ApiResponse<ProcessStepResponse> updateProcessStep(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProcessStepRequest request) {
        ProcessStepResponse response = farmingProcessService.updateProcessStep(id, request);
        return ApiResponse.success("Cập nhật bước quy trình thành công", response);
    }

    @DeleteMapping("/processes/{id}")
    public ApiResponse<Void> deleteProcessStep(@PathVariable Long id) {
        farmingProcessService.deleteProcessStep(id);
        return ApiResponse.success("Xóa bước quy trình thành công", null);
    }

    @PatchMapping("/processes/{id}/reorder")
    public ApiResponse<ProcessStepResponse> reorderProcessStep(
            @PathVariable Long id,
            @RequestParam("stepNo") Integer stepNo) {
        ProcessStepResponse response = farmingProcessService.reorderProcessStep(id, stepNo);
        return ApiResponse.success("Cập nhật thứ tự bước thành công", response);
    }

    @PatchMapping("/seasons/{seasonId}/processes/reorder")
    public ApiResponse<Void> reorderProcesses(
            @PathVariable Long seasonId,
            @Valid @RequestBody ReorderProcessRequest request) {
        farmingProcessService.reorderProcesses(seasonId, request);
        return ApiResponse.success("Cập nhật thứ tự thành công", null);
    }
}
