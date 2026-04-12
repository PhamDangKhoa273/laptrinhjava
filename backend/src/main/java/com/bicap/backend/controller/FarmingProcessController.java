package com.bicap.backend.controller;

<<<<<<< Updated upstream:backend/src/main/java/com/bicap/backend/controller/FarmingProcessController.java
import com.bicap.backend.dto.request.CreateProcessStepRequest;
import com.bicap.backend.dto.request.ReorderProcessRequest;
import com.bicap.backend.dto.request.UpdateProcessStepRequest;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.dto.response.ProcessStepResponse;
import com.bicap.backend.dto.response.ProcessTimelineResponse;
import com.bicap.backend.service.FarmingProcessService;
=======
import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.season.dto.*;
import com.bicap.modules.season.service.FarmingProcessService;
>>>>>>> Stashed changes:backend/src/main/java/com/bicap/modules/season/controller/FarmingProcessController.java
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
<<<<<<< Updated upstream:backend/src/main/java/com/bicap/backend/controller/FarmingProcessController.java
@RequestMapping("/api")
=======
@RequestMapping("/api/processes")
>>>>>>> Stashed changes:backend/src/main/java/com/bicap/modules/season/controller/FarmingProcessController.java
@RequiredArgsConstructor
public class FarmingProcessController {

    private final FarmingProcessService farmingProcessService;

    @PostMapping("/season/{seasonId}")
    public ApiResponse<ProcessStepResponse> createStep(@PathVariable Long seasonId, 
                                                       @Valid @RequestBody CreateProcessStepRequest request) {
        ProcessStepResponse response = farmingProcessService.createProcessStep(seasonId, request);
        return ApiResponse.success("Ghi nhận bước quy trình thành công", response);
    }

    @GetMapping("/season/{seasonId}")
    public ApiResponse<ProcessTimelineResponse> getBySeason(@PathVariable Long seasonId) {
        ProcessTimelineResponse response = farmingProcessService.getProcessesBySeason(seasonId);
        return ApiResponse.success(response);
    }

    @GetMapping("/{id}")
    public ApiResponse<ProcessStepResponse> getDetail(@PathVariable Long id) {
        ProcessStepResponse response = farmingProcessService.getProcessDetail(id);
        return ApiResponse.success(response);
    }

    @PutMapping("/{id}")
    public ApiResponse<ProcessStepResponse> updateStep(@PathVariable Long id, 
                                                       @Valid @RequestBody UpdateProcessStepRequest request) {
        ProcessStepResponse response = farmingProcessService.updateProcessStep(id, request);
        return ApiResponse.success("Cập nhật bước quy trình thành công", response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteStep(@PathVariable Long id) {
        farmingProcessService.deleteProcessStep(id);
        return ApiResponse.success("Xóa bước quy trình thành công", null);
    }

    @PatchMapping("/{id}/reorder")
    public ApiResponse<ProcessStepResponse> reorderStep(@PathVariable Long id, @RequestParam Integer stepNo) {
        ProcessStepResponse response = farmingProcessService.reorderProcessStep(id, stepNo);
        return ApiResponse.success("Thay đổi thứ tự thành công", response);
    }

    @PostMapping("/season/{seasonId}/reorder")
    public ApiResponse<Void> reorderAll(@PathVariable Long seasonId, @RequestBody ReorderProcessRequest request) {
        farmingProcessService.reorderProcesses(seasonId, request);
        return ApiResponse.success("Sắp xếp lại toàn bộ quy trình thành công", null);
    }
}
