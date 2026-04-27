package com.bicap.modules.season.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.batch.dto.ProcessBlockchainPayload;
import com.bicap.modules.batch.service.BlockchainService;
import com.bicap.modules.season.dto.CreateProcessStepRequest;
import com.bicap.modules.season.dto.ProcessStepResponse;
import com.bicap.modules.season.dto.ProcessTimelineResponse;
import com.bicap.modules.season.dto.ReorderProcessRequest;
import com.bicap.modules.season.dto.UpdateProcessStepRequest;
import com.bicap.modules.season.entity.FarmingProcess;
import com.bicap.modules.season.entity.FarmingSeason;
import com.bicap.modules.season.repository.FarmingProcessRepository;
import com.bicap.modules.season.repository.FarmingSeasonRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
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
        seasonService.ensureProcessMutationAllowed(season);

        if (farmingProcessRepository.existsBySeason_SeasonIdAndStepNo(seasonId, request.getStepNo())) {
            throw new BusinessException("Số thứ tự bước " + request.getStepNo() + " đã tồn tại trong mùa vụ này.");
        }

        seasonService.validateProcessDateAgainstSeason(season, request.getPerformedAt());

        User recorder = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy thông tin người dùng hiện tại."));

        FarmingProcess process = FarmingProcess.builder()
                .season(season)
                .stepNo(request.getStepNo())
                .stepName(normalizeStepName(request.getStepName()))
                .performedAt(request.getPerformedAt())
                .description(normalizeOptionalText(request.getDescription()))
                .imageUrl(normalizeOptionalText(request.getImageUrl()))
                .recordedBy(recorder)
                .build();

        FarmingProcess saved = farmingProcessRepository.save(process);

        ProcessBlockchainPayload payload = ProcessBlockchainPayload.builder()
                .processId(saved.getId())
                .seasonId(seasonId)
                .stepNo(saved.getStepNo())
                .stepName(saved.getStepName())
                .performedAt(saved.getPerformedAt())
                .description(saved.getDescription())
                .build();
        blockchainService.saveProcess(payload, "CREATE");

        return ProcessStepResponse.fromEntity(saved, recorder.getFullName());
    }

    public ProcessTimelineResponse getProcessesBySeason(Long seasonId) {
        FarmingSeason season = farmingSeasonRepository.findById(seasonId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy mùa vụ với ID: " + seasonId));

        List<FarmingProcess> processes = farmingProcessRepository.findBySeason_SeasonIdOrderByStepNoAsc(seasonId);

        List<ProcessStepResponse> steps = processes.stream()
                .map(p -> ProcessStepResponse.fromEntity(p, p.getRecordedBy() != null ? p.getRecordedBy().getFullName() : null))
                .collect(Collectors.toList());

        ProcessTimelineResponse.SeasonInfo seasonInfo = ProcessTimelineResponse.SeasonInfo.builder()
                .seasonId(season.getSeasonId())
                .seasonName(season.getSeasonCode())
                .startDate(season.getStartDate())
                .expectedHarvestDate(season.getExpectedHarvestDate())
                .actualHarvestDate(season.getActualHarvestDate())
                .farmingMethod(season.getFarmingMethod())
                .seasonStatus(season.getSeasonStatus())
                .totalSteps(steps.size())
                .build();

        return ProcessTimelineResponse.builder()
                .seasonInfo(seasonInfo)
                .steps(steps)
                .build();
    }

    public ProcessStepResponse getProcessDetail(Long id) {
        FarmingProcess process = farmingProcessRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy bước quy trình với ID: " + id));
        return ProcessStepResponse.fromEntity(process, process.getRecordedBy() != null ? process.getRecordedBy().getFullName() : null);
    }

    @Transactional
    public ProcessStepResponse updateProcessStep(Long id, UpdateProcessStepRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        FarmingProcess process = farmingProcessRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy bước quy trình với ID: " + id));
        FarmingSeason season = seasonService.findSeasonAndCheckPermission(process.getSeason().getSeasonId(), currentUserId);
        seasonService.ensureProcessMutationAllowed(season);

        Integer nextStepNo = request.getStepNo() != null ? request.getStepNo() : process.getStepNo();
        String nextStepName = request.getStepName() != null ? normalizeStepName(request.getStepName()) : process.getStepName();
        LocalDateTime nextPerformedAt = request.getPerformedAt() != null ? request.getPerformedAt() : process.getPerformedAt();
        String nextDescription = request.getDescription() != null ? normalizeOptionalText(request.getDescription()) : process.getDescription();
        String nextImageUrl = request.getImageUrl() != null ? normalizeOptionalText(request.getImageUrl()) : process.getImageUrl();

        if (farmingProcessRepository.existsBySeason_SeasonIdAndStepNoAndIdNot(process.getSeason().getSeasonId(), nextStepNo, id)) {
            throw new BusinessException("Số thứ tự bước " + nextStepNo + " đã tồn tại.");
        }

        seasonService.validateProcessDateAgainstSeason(season, nextPerformedAt);
        process.setStepNo(nextStepNo);
        process.setStepName(nextStepName);
        process.setPerformedAt(nextPerformedAt);
        process.setDescription(nextDescription);
        process.setImageUrl(nextImageUrl);

        FarmingProcess updated = farmingProcessRepository.save(process);
        ProcessBlockchainPayload payload = ProcessBlockchainPayload.builder()
                .processId(updated.getId())
                .seasonId(process.getSeason().getSeasonId())
                .stepNo(updated.getStepNo())
                .stepName(updated.getStepName())
                .performedAt(updated.getPerformedAt())
                .description(updated.getDescription())
                .build();
        blockchainService.saveProcess(payload, "UPDATE");

        return ProcessStepResponse.fromEntity(updated, updated.getRecordedBy() != null ? updated.getRecordedBy().getFullName() : null);
    }

    @Transactional
    public void deleteProcessStep(Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        FarmingProcess process = farmingProcessRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy bước quy trình với ID: " + id));
        FarmingSeason season = seasonService.findSeasonAndCheckPermission(process.getSeason().getSeasonId(), currentUserId);
        seasonService.ensureProcessMutationAllowed(season);

        ProcessBlockchainPayload payload = ProcessBlockchainPayload.builder()
                .processId(process.getId())
                .seasonId(process.getSeason().getSeasonId())
                .stepNo(process.getStepNo())
                .stepName(process.getStepName())
                .performedAt(process.getPerformedAt())
                .description("DELETED")
                .build();
        blockchainService.saveProcess(payload, "DELETE");
        farmingProcessRepository.delete(process);
    }

    @Transactional
    public ProcessStepResponse reorderProcessStep(Long id, Integer stepNo) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        FarmingProcess process = farmingProcessRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy bước quy trình với ID: " + id));
        FarmingSeason season = seasonService.findSeasonAndCheckPermission(process.getSeason().getSeasonId(), currentUserId);
        seasonService.ensureProcessMutationAllowed(season);
        if (farmingProcessRepository.existsBySeason_SeasonIdAndStepNoAndIdNot(process.getSeason().getSeasonId(), stepNo, id)) {
            throw new BusinessException("Số thứ tự bước đã tồn tại trong mùa vụ này.");
        }

        process.setStepNo(stepNo);
        FarmingProcess updated = farmingProcessRepository.save(process);
        return ProcessStepResponse.fromEntity(updated, updated.getRecordedBy() != null ? updated.getRecordedBy().getFullName() : null);
    }

    @Transactional
    public void reorderProcesses(Long seasonId, ReorderProcessRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        FarmingSeason season = seasonService.findSeasonAndCheckPermission(seasonId, currentUserId);
        seasonService.ensureProcessMutationAllowed(season);
        int index = 1;
        for (Long processId : request.getProcessIds()) {
            int currentStep = index++;
            FarmingProcess process = farmingProcessRepository.findById(processId)
                    .orElseThrow(() -> new BusinessException("Không tìm thấy bước quy trình với ID: " + processId));
            if (!process.getSeason().getSeasonId().equals(seasonId)) {
                throw new BusinessException("Bước quy trình không thuộc mùa vụ cần sắp xếp.");
            }
            process.setStepNo(currentStep);
            farmingProcessRepository.save(process);
        }
    }

    private String normalizeStepName(String stepName) {
        if (stepName == null || stepName.trim().isBlank()) {
            throw new BusinessException("Tên bước quy trình không được để trống.");
        }
        return stepName.trim().replaceAll("\\s+", " ");
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().replaceAll("\\s+", " ");
        return normalized.isBlank() ? null : normalized;
    }
}
