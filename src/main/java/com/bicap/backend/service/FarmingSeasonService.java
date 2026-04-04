package com.bicap.backend.service;

import com.bicap.backend.dto.request.FarmingSeasonRequest;
import com.bicap.backend.dto.response.FarmingSeasonResponse;
import com.bicap.backend.entity.Farm;
import com.bicap.backend.entity.FarmingSeason;
import com.bicap.backend.entity.User;
import com.bicap.backend.enums.RoleName;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.FarmRepository;
import com.bicap.backend.repository.FarmingSeasonRepository;
import com.bicap.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FarmingSeasonService {

    private final FarmingSeasonRepository farmingSeasonRepository;
    private final FarmRepository farmRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final BlockchainService blockchainService;
    private final AuditLogService auditLogService;

    @Transactional
    public FarmingSeasonResponse createSeason(FarmingSeasonRequest request, Long currentUserId) {
        Farm farm = getFarmAndCheckPermission(request.getFarmId(), currentUserId);

        FarmingSeason season = new FarmingSeason();
        season.setFarm(farm);
        season.setName(request.getName().trim());
        season.setPlantName(request.getPlantName().trim());
        season.setStartDate(request.getStartDate());
        season.setExpectedEndDate(request.getExpectedEndDate());
        
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            season.setStatus(request.getStatus().trim().toUpperCase());
        } else {
            season.setStatus("PLANNED");
        }

        // Interaction with Blockchain
        String txHash = blockchainService.saveSeasonToBlockchain(season);
        season.setBlockchainTxHash(txHash);

        FarmingSeason saved = farmingSeasonRepository.save(season);

        auditLogService.log(currentUserId, "CREATE_FARMING_SEASON", "FARMING_SEASON", saved.getSeasonId());

        return toResponse(saved);
    }

    @Transactional
    public FarmingSeasonResponse updateSeason(Long seasonId, FarmingSeasonRequest request, Long currentUserId) {
        FarmingSeason season = getSeasonEntityById(seasonId);
        getFarmAndCheckPermission(season.getFarm().getFarmId(), currentUserId);

        season.setName(request.getName().trim());
        season.setPlantName(request.getPlantName().trim());
        season.setStartDate(request.getStartDate());
        season.setExpectedEndDate(request.getExpectedEndDate());

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            season.setStatus(request.getStatus().trim().toUpperCase());
        }

        // Optionally, update on blockchain
        String txHash = blockchainService.saveSeasonToBlockchain(season);
        season.setBlockchainTxHash(txHash);

        FarmingSeason saved = farmingSeasonRepository.save(season);

        auditLogService.log(currentUserId, "UPDATE_FARMING_SEASON", "FARMING_SEASON", saved.getSeasonId());

        return toResponse(saved);
    }

    public FarmingSeasonResponse getSeasonById(Long seasonId) {
        FarmingSeason season = getSeasonEntityById(seasonId);
        return toResponse(season);
    }

    public List<FarmingSeasonResponse> getSeasonsByFarmId(Long farmId) {
        List<FarmingSeason> seasons = farmingSeasonRepository.findByFarm_FarmId(farmId);
        return seasons.stream().map(this::toResponse).toList();
    }

    public List<FarmingSeasonResponse> getAllSeasons() {
        return farmingSeasonRepository.findAll().stream().map(this::toResponse).toList();
    }

    private Farm getFarmAndCheckPermission(Long farmId, Long currentUserId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy farm"));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user hiện tại"));

        boolean isAdmin = userService.hasRole(currentUser, RoleName.ADMIN);
        boolean isOwner = farm.getOwnerUser() != null
                && farm.getOwnerUser().getUserId().equals(currentUserId);

        if (!isAdmin && !isOwner) {
            throw new BusinessException("Bạn không có quyền thao tác mùa vụ trên farm này");
        }

        return farm;
    }

    private FarmingSeason getSeasonEntityById(Long seasonId) {
        return farmingSeasonRepository.findById(seasonId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy mùa vụ"));
    }

    private FarmingSeasonResponse toResponse(FarmingSeason season) {
        return FarmingSeasonResponse.builder()
                .id(season.getSeasonId())
                .farmId(season.getFarm() != null ? season.getFarm().getFarmId() : null)
                .farmName(season.getFarm() != null ? season.getFarm().getFarmName() : null)
                .name(season.getName())
                .plantName(season.getPlantName())
                .startDate(season.getStartDate())
                .expectedEndDate(season.getExpectedEndDate())
                .status(season.getStatus())
                .blockchainTxHash(season.getBlockchainTxHash())
                .createdAt(season.getCreatedAt())
                .updatedAt(season.getUpdatedAt())
                .build();
    }
}
