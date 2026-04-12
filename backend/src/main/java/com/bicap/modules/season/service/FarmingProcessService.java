package com.bicap.modules.season.service;

import com.bicap.modules.user.entity.User;
import com.bicap.modules.batch.service.BlockchainService;
import com.bicap.modules.season.entity.FarmingProcess;
import com.bicap.modules.season.repository.FarmingProcessRepository;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.season.repository.FarmingSeasonRepository;
import com.bicap.modules.season.entity.FarmingSeason;
import com.bicap.modules.season.dto.CreateProcessStepRequest;
import com.bicap.modules.season.dto.ReorderProcessRequest;
import com.bicap.modules.season.dto.UpdateProcessStepRequest;
import com.bicap.modules.season.dto.ProcessStepResponse;
import com.bicap.modules.season.dto.ProcessTimelineResponse;
import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class FarmingProcessService {

    private final FarmingProcessRepository farmingProcessRepository;
    private final FarmingSeasonRepository farmingSeasonRepository;
    private final UserRepository userRepository;
    private final BlockchainService blockchainService;
    private final SeasonService seasonService;

    @Transactional
    public ProcessStepResponse createProcessStep(Long seasonId, CreateProcessStepRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        FarmingSeason season = seasonService.findSeasonAndCheckPermission(seasonId, currentUserId);

        if (farmingProcessRepository.existsBySeason_SeasonIdAndStepNo(seasonId, request.getStepNo())) {
            throw new BusinessException("Số thứ tự bước " + request.getStepNo() + " đã tồn tại trong mùa vụ này.");
        }

        User recorder = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy thông tin người dùng hiện tại."));

        FarmingProcess process = FarmingProcess.builder()
                .season(season)
                .stepNo(request.getStepNo())
                .stepName(request.getStepName())
                .performedAt(request.getPerformedAt())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .recordedBy(recorder)
                .build();

        FarmingProcess saved = farmingProcessRepository.save(process);

        // Blockchain integration
        String payload = String.format("SEASON:%d|STEP:%d|NAME:%s", seasonId, saved.getStepNo(), saved.getStepName());
        String txHash = blockchainService.saveProcess(saved.getId(), "CREATE", payload);

        return ProcessStepResponse.fromEntity(saved, txHash);
    }

    public ProcessTimelineResponse getProcessesBySeason(Long seasonId) {
        FarmingSeason season = farmingSeasonRepository.findById(seasonId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy mùa vụ với ID: " + seasonId));

        List<FarmingProcess> processes = farmingProcessRepository.findBySeason_SeasonIdOrderByStepNoAsc(seasonId);

        List<ProcessStepResponse> steps = processes.stream()
                .map(p -> ProcessStepResponse.fromEntity(p, null)) 
                .collect(Collectors.toList());

        ProcessTimelineResponse.SeasonInfo seasonInfo = ProcessTimelineResponse.SeasonInfo.builder()
                .seasonId(season.getSeasonId())
                .seasonName(season.getSeasonCode()) 
                .startDate(season.getStartDate())
                .expectedHarvestDate(season.getExpectedHarvestDate())
                .seasonStatus(season.getSeasonStatus())
                .build();

        return ProcessTimelineResponse.builder()
                .seasonInfo(seasonInfo)
                .steps(steps)
                .build();
    }

    public ProcessStepResponse getProcessDetail(Long id) {
        FarmingProcess process = farmingProcessRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy bước quy trình với ID: " + id));
        return ProcessStepResponse.fromEntity(process, null);
    }

    @Transactional
    public ProcessStepResponse updateProcessStep(Long id, UpdateProcessStepRequest request) {
        FarmingProcess process = farmingProcessRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy bước quy trình với ID: " + id));

        if (farmingProcessRepository.existsBySeason_SeasonIdAndStepNoAndIdNot(process.getSeason().getSeasonId(), request.getStepNo(), id)) {
            throw new BusinessException("Số thứ tự bước " + request.getStepNo() + " đã tồn tại.");
        }

        process.setStepNo(request.getStepNo());
        process.setStepName(request.getStepName());
        process.setPerformedAt(request.getPerformedAt());
        process.setDescription(request.getDescription());
        process.setImageUrl(request.getImageUrl());

        FarmingProcess updated = farmingProcessRepository.save(process);

        // Blockchain integration
        String payload = String.format("SEASON:%d|STEP:%d|NAME:%s|UPDATE", process.getSeason().getSeasonId(), updated.getStepNo(), updated.getStepName());
        String txHash = blockchainService.saveProcess(updated.getId(), "UPDATE", payload);

        return ProcessStepResponse.fromEntity(updated, txHash);
    }

    @Transactional
    public void deleteProcessStep(Long id) {
        FarmingProcess process = farmingProcessRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy bước quy trình với ID: " + id));
        
        blockchainService.saveProcess(id, "DELETE", "DELETED");
        farmingProcessRepository.delete(process);
    }

    @Transactional
    public ProcessStepResponse reorderProcessStep(Long id, Integer stepNo) {
        FarmingProcess process = farmingProcessRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy bước quy trình với ID: " + id));
        
        process.setStepNo(stepNo);
        FarmingProcess updated = farmingProcessRepository.save(process);
        return ProcessStepResponse.fromEntity(updated, null);
    }

    @Transactional
    public void reorderProcesses(Long seasonId, ReorderProcessRequest request) {
        int index = 1;
        for (Long processId : request.getProcessIds()) {
            int currentStep = index++;
            farmingProcessRepository.findById(processId).ifPresent(p -> {
                p.setStepNo(currentStep);
                farmingProcessRepository.save(p);
            });
        }
    }
}
