package com.bicap.backend.service;

import com.bicap.backend.dto.request.CreateProcessStepRequest;
import com.bicap.backend.dto.request.ReorderProcessRequest;
import com.bicap.backend.dto.request.UpdateProcessStepRequest;
import com.bicap.backend.dto.response.ProcessStepResponse;
import com.bicap.backend.dto.response.ProcessTimelineResponse;
import com.bicap.backend.entity.BlockchainTransaction;
import com.bicap.backend.entity.FarmingProcess;
import com.bicap.backend.entity.FarmingSeason;
import com.bicap.backend.entity.User;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.BlockchainTransactionRepository;
import com.bicap.backend.repository.FarmingProcessRepository;
import com.bicap.backend.repository.FarmingSeasonRepository;
import com.bicap.backend.repository.UserRepository;
import com.bicap.backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FarmingProcessService {

    private static final String PROCESS_ENTITY_TYPE = "PROCESS";

    private final FarmingProcessRepository processRepository;
    private final FarmingSeasonRepository seasonRepository;
    private final UserRepository userRepository;
    private final BlockchainTransactionRepository blockchainTransactionRepository;
    private final BlockchainService blockchainService;

    @Transactional
    public ProcessStepResponse createProcessStep(Long seasonId, CreateProcessStepRequest request) {
        FarmingSeason season = seasonRepository.findById(seasonId)
                .orElseThrow(() -> new BusinessException("Mùa vụ không tồn tại"));

        validateSeasonIsOpen(season, "Không thể thêm bước vào mùa vụ đã đóng");
        validatePerformedAt(season, request.getPerformedAt());

        if (processRepository.existsBySeasonIdAndStepNo(seasonId, request.getStepNo())) {
            throw new BusinessException("Thứ tự bước (step_no) đã tồn tại trong mùa vụ");
        }

        Long userId = SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.getReferenceById(userId);

        FarmingProcess process = FarmingProcess.builder()
                .season(season)
                .stepNo(request.getStepNo())
                .stepName(request.getStepName())
                .performedAt(request.getPerformedAt())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .recordedBy(currentUser)
                .build();

        process = processRepository.save(process);

        String txHash = blockchainService.saveProcess(process.getId(), "CREATE", buildProcessPayload(process));
        return ProcessStepResponse.fromEntity(process, txHash);
    }

    public ProcessTimelineResponse getProcessesBySeason(Long seasonId) {
        FarmingSeason season = seasonRepository.findById(seasonId)
                .orElseThrow(() -> new BusinessException("Mùa vụ không tồn tại"));

        List<FarmingProcess> processes = processRepository.findBySeasonIdOrderByStepNoAsc(seasonId);
        Map<Long, String> latestTxHashes = getLatestTxHashes(processes);

        List<ProcessStepResponse> stepResponses = processes.stream()
                .map(p -> ProcessStepResponse.fromEntity(p, latestTxHashes.get(p.getId())))
                .collect(Collectors.toList());

        ProcessTimelineResponse.SeasonInfo seasonInfo = ProcessTimelineResponse.SeasonInfo.builder()
                .seasonId(season.getId())
                .seasonName(season.getSeasonName())
                .startDate(season.getStartDate())
                .endDate(season.getEndDate())
                .status(season.getStatus())
                .build();

        return ProcessTimelineResponse.builder()
                .seasonInfo(seasonInfo)
                .steps(stepResponses)
                .build();
    }

    public ProcessStepResponse getProcessDetail(Long processId) {
        FarmingProcess process = processRepository.findById(processId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy bước quy trình"));

        String txHash = blockchainTransactionRepository
                .findTopByRelatedEntityTypeAndRelatedEntityIdOrderByCreatedAtDesc(PROCESS_ENTITY_TYPE, processId)
                .map(BlockchainTransaction::getTxHash)
                .orElse(null);

        return ProcessStepResponse.fromEntity(process, txHash);
    }

    @Transactional
    public ProcessStepResponse updateProcessStep(Long processId, UpdateProcessStepRequest request) {
        FarmingProcess process = processRepository.findById(processId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy bước quy trình"));

        FarmingSeason season = process.getSeason();
        validateSeasonIsOpen(season, "Không thể cập nhật bước trong mùa vụ đã đóng");
        validatePerformedAt(season, request.getPerformedAt());

        if (processRepository.existsBySeasonIdAndStepNoAndIdNot(season.getId(), request.getStepNo(), processId)) {
            throw new BusinessException("Thứ tự bước (step_no) đã tồn tại trong mùa vụ");
        }

        process.setStepNo(request.getStepNo());
        process.setStepName(request.getStepName());
        process.setPerformedAt(request.getPerformedAt());
        process.setDescription(request.getDescription());
        process.setImageUrl(request.getImageUrl());

        process = processRepository.save(process);

        String txHash = blockchainService.saveProcess(process.getId(), "UPDATE", buildProcessPayload(process));
        return ProcessStepResponse.fromEntity(process, txHash);
    }

    @Transactional
    public void deleteProcessStep(Long processId) {
        FarmingProcess process = processRepository.findById(processId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy bước quy trình"));

        validateSeasonIsOpen(process.getSeason(), "Không thể xóa bước trong mùa vụ đã đóng");

        blockchainService.saveProcess(process.getId(), "DELETE", buildProcessPayload(process));
        processRepository.delete(process);
    }

    @Transactional
    public ProcessStepResponse reorderProcessStep(Long processId, Integer newStepNo) {
        FarmingProcess process = processRepository.findById(processId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy bước quy trình"));

        if (newStepNo == null) {
            throw new BusinessException("step_no mới không được để trống");
        }

        FarmingSeason season = process.getSeason();
        validateSeasonIsOpen(season, "Không thể thay đổi thứ tự trong mùa vụ đã đóng");

        if (Objects.equals(process.getStepNo(), newStepNo)) {
            String txHash = blockchainTransactionRepository
                    .findTopByRelatedEntityTypeAndRelatedEntityIdOrderByCreatedAtDesc(PROCESS_ENTITY_TYPE, processId)
                    .map(BlockchainTransaction::getTxHash)
                    .orElse(null);
            return ProcessStepResponse.fromEntity(process, txHash);
        }

        if (processRepository.existsBySeasonIdAndStepNoAndIdNot(season.getId(), newStepNo, processId)) {
            throw new BusinessException("Thứ tự bước (step_no) đã tồn tại trong mùa vụ");
        }

        Integer oldStepNo = process.getStepNo();
        process.setStepNo(newStepNo);
        process = processRepository.save(process);

        String txHash = blockchainService.saveProcess(process.getId(), "REORDER",
                buildSingleReorderPayload(process.getId(), season.getId(), oldStepNo, newStepNo));
        return ProcessStepResponse.fromEntity(process, txHash);
    }

    @Transactional
    public void reorderProcesses(Long seasonId, ReorderProcessRequest request) {
        FarmingSeason season = seasonRepository.findById(seasonId)
                .orElseThrow(() -> new BusinessException("Mùa vụ không tồn tại"));

        validateSeasonIsOpen(season, "Không thể thay đổi thứ tự trong mùa vụ đã đóng");

        List<FarmingProcess> processes = processRepository.findBySeasonIdOrderByStepNoAsc(seasonId);
        if (processes.isEmpty()) {
            throw new BusinessException("Mùa vụ chưa có bước quy trình để sắp xếp");
        }

        List<Long> requestedIds = request.getProcessIds();
        if (requestedIds == null || requestedIds.isEmpty()) {
            throw new BusinessException("Danh sách processIds không được để trống");
        }

        if (requestedIds.size() != processes.size()) {
            throw new BusinessException("Danh sách processIds phải chứa đầy đủ các bước của mùa vụ");
        }

        Set<Long> uniqueIds = new HashSet<>(requestedIds);
        if (uniqueIds.size() != requestedIds.size()) {
            throw new BusinessException("Danh sách processIds không được chứa phần tử trùng lặp");
        }

        Map<Long, FarmingProcess> processMap = processes.stream()
                .collect(Collectors.toMap(FarmingProcess::getId, p -> p));

        if (!processMap.keySet().equals(uniqueIds)) {
            throw new BusinessException("Danh sách processIds không hợp lệ cho mùa vụ này");
        }

        int offset = processes.size() + 1000;
        for (FarmingProcess process : processes) {
            process.setStepNo(process.getStepNo() + offset);
        }
        processRepository.saveAll(processes);

        int newStepNo = 1;
        for (Long processId : requestedIds) {
            FarmingProcess process = processMap.get(processId);
            process.setStepNo(newStepNo++);
        }
        processRepository.saveAll(processes);

        blockchainService.saveProcess(seasonId, "REORDER", buildReorderPayload(seasonId, requestedIds));
    }

    private String buildSingleReorderPayload(Long processId, Long seasonId, Integer oldStepNo, Integer newStepNo) {
        return "{" +
                "\"processId\":" + processId +
                ",\"seasonId\":" + seasonId +
                ",\"oldStepNo\":" + oldStepNo +
                ",\"newStepNo\":" + newStepNo +
                "}";
    }

    private void validateSeasonIsOpen(FarmingSeason season, String message) {
        if ("CLOSED".equalsIgnoreCase(season.getStatus())) {
            throw new BusinessException(message);
        }
    }

    private void validatePerformedAt(FarmingSeason season, java.time.LocalDateTime performedAt) {
        if (performedAt.toLocalDate().isBefore(season.getStartDate())) {
            throw new BusinessException("Thời gian thực hiện không được trước ngày bắt đầu mùa vụ");
        }

        if (season.getEndDate() != null && performedAt.toLocalDate().isAfter(season.getEndDate())) {
            throw new BusinessException("Thời gian thực hiện không được sau ngày kết thúc mùa vụ");
        }
    }

    private Map<Long, String> getLatestTxHashes(List<FarmingProcess> processes) {
        if (processes.isEmpty()) {
            return Map.of();
        }

        List<Long> processIds = processes.stream()
                .map(FarmingProcess::getId)
                .filter(Objects::nonNull)
                .toList();

        Map<Long, BlockchainTransaction> latestTxByProcessId = new HashMap<>();
        for (BlockchainTransaction tx : blockchainTransactionRepository.findByRelatedEntityTypeAndRelatedEntityIdIn(PROCESS_ENTITY_TYPE, processIds)) {
            BlockchainTransaction current = latestTxByProcessId.get(tx.getRelatedEntityId());
            if (current == null || isAfter(tx, current)) {
                latestTxByProcessId.put(tx.getRelatedEntityId(), tx);
            }
        }

        return latestTxByProcessId.entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, entry -> entry.getValue().getTxHash()));
    }

    private boolean isAfter(BlockchainTransaction candidate, BlockchainTransaction current) {
        if (candidate.getCreatedAt() == null) {
            return false;
        }
        if (current.getCreatedAt() == null) {
            return true;
        }
        return candidate.getCreatedAt().isAfter(current.getCreatedAt());
    }

    private String buildProcessPayload(FarmingProcess process) {
        Long seasonId = process.getSeason() != null ? process.getSeason().getId() : null;
        Long recordedByUserId = process.getRecordedBy() != null ? process.getRecordedBy().getUserId() : null;

        return "{" +
                "\"processId\":" + process.getId() +
                ",\"seasonId\":" + seasonId +
                ",\"stepNo\":" + process.getStepNo() +
                ",\"stepName\":\"" + escapeJson(process.getStepName()) + "\"" +
                ",\"performedAt\":\"" + process.getPerformedAt() + "\"" +
                ",\"description\":\"" + escapeJson(process.getDescription()) + "\"" +
                ",\"imageUrl\":\"" + escapeJson(process.getImageUrl()) + "\"" +
                ",\"recordedByUserId\":" + recordedByUserId +
                "}";
    }

    private String buildReorderPayload(Long seasonId, List<Long> processIds) {
        return "{" +
                "\"seasonId\":" + seasonId +
                ",\"processIds\":" + processIds +
                "}";
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", "\\r")
                .replace("\n", "\\n");
    }
}
