package com.bicap.backend.service;

import com.bicap.backend.dto.request.CreateSeasonRequest;
import com.bicap.backend.dto.request.UpdateSeasonRequest;
import com.bicap.backend.dto.response.SeasonResponse;
import com.bicap.backend.entity.*;
import com.bicap.backend.enums.RoleName;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeasonService {

    private final FarmingSeasonRepository farmingSeasonRepository;
    private final FarmRepository farmRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final BlockchainService blockchainService;
    private final AuditLogService auditLogService;

    @Transactional
    public SeasonResponse createSeason(CreateSeasonRequest request, Long currentUserId) {
        // 1. Validation: Farm exists and is APPROVED
        Farm farm = farmRepository.findById(request.getFarmId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy Farm với ID: " + request.getFarmId()));
        
        if (!"APPROVED".equalsIgnoreCase(farm.getApprovalStatus())) {
            throw new BusinessException("Farm chưa được duyệt (Trạng thái: " + farm.getApprovalStatus() + "). Không thể tạo mùa vụ.");
        }

        // 2. Permission Check
        checkPermission(farm, currentUserId);

        // 3. Validation: Product exists
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy sản phẩm với ID: " + request.getProductId()));

        // 4. Validation: Date logic (Expected >= Start)
        if (request.getExpectedHarvestDate() != null && request.getExpectedHarvestDate().isBefore(request.getStartDate())) {
            throw new BusinessException("Ngày thu hoạch dự kiến phải sau hoặc bằng ngày bắt đầu.");
        }

        // 5. Validation: Unique Season Code
        if (farmingSeasonRepository.findBySeasonCode(request.getSeasonCode()).isPresent()) {
            throw new BusinessException("Mã mùa vụ '" + request.getSeasonCode() + "' đã tồn tại.");
        }

        // 6. Map and Save
        FarmingSeason season = new FarmingSeason();
        season.setFarm(farm);
        season.setProduct(product);
        season.setSeasonCode(request.getSeasonCode().trim());
        season.setStartDate(request.getStartDate());
        season.setExpectedHarvestDate(request.getExpectedHarvestDate());
        season.setFarmingMethod(request.getFarmingMethod());
        season.setSeasonStatus("PLANNED");

        FarmingSeason saved = farmingSeasonRepository.save(season);

        // 7. Blockchain Integration
        blockchainService.saveSeason(saved);

        // 8. Audit Log
        auditLogService.log(currentUserId, "CREATE_SEASON", "FARMING_SEASON", saved.getSeasonId());

        return mapToResponse(saved);
    }

    @Transactional
    public SeasonResponse updateSeason(Long seasonId, UpdateSeasonRequest request, Long currentUserId) {
        FarmingSeason season = farmingSeasonRepository.findById(seasonId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy mùa vụ với ID: " + seasonId));

        checkPermission(season.getFarm(), currentUserId);

        // Validation: Date logic
        if (request.getExpectedHarvestDate() != null && request.getExpectedHarvestDate().isBefore(request.getStartDate())) {
            throw new BusinessException("Ngày thu hoạch dự kiến phải sau hoặc bằng ngày bắt đầu.");
        }

        // Validation: Unique Season Code (if changed)
        if (!season.getSeasonCode().equals(request.getSeasonCode().trim())) {
            if (farmingSeasonRepository.findBySeasonCode(request.getSeasonCode().trim()).isPresent()) {
                throw new BusinessException("Mã mùa vụ '" + request.getSeasonCode() + "' đã tồn tại.");
            }
        }

        season.setSeasonCode(request.getSeasonCode().trim());
        season.setStartDate(request.getStartDate());
        season.setExpectedHarvestDate(request.getExpectedHarvestDate());
        season.setActualHarvestDate(request.getActualHarvestDate());
        season.setFarmingMethod(request.getFarmingMethod());

        if (request.getActualHarvestDate() != null) {
            season.setSeasonStatus("HARVESTED");
        } else if (request.getSeasonStatus() != null && !request.getSeasonStatus().isBlank()) {
            season.setSeasonStatus(request.getSeasonStatus().trim().toUpperCase());
        }

        FarmingSeason saved = farmingSeasonRepository.save(season);

        // Blockchain Integration
        blockchainService.saveSeason(saved);

        auditLogService.log(currentUserId, "UPDATE_SEASON", "FARMING_SEASON", saved.getSeasonId());

        return mapToResponse(saved);
    }

    public SeasonResponse getSeasonById(Long seasonId) {
        FarmingSeason season = farmingSeasonRepository.findById(seasonId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy mùa vụ với ID: " + seasonId));
        return mapToResponse(season);
    }

    public List<SeasonResponse> getAllSeasons() {
        return farmingSeasonRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<SeasonResponse> getSeasonsByFarmId(Long farmId) {
        return farmingSeasonRepository.findByFarm_FarmId(farmId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Internal utility for other services to get a validated season
     */
    public FarmingSeason findSeasonAndCheckPermission(Long seasonId, Long currentUserId) {
        FarmingSeason season = farmingSeasonRepository.findById(seasonId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy mùa vụ với ID: " + seasonId));
        checkPermission(season.getFarm(), currentUserId);
        return season;
    }

    private void checkPermission(Farm farm, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("User không tồn tại"));

        boolean isAdmin = userService.hasRole(currentUser, RoleName.ADMIN);
        boolean isOwner = farm.getOwnerUser() != null && farm.getOwnerUser().getUserId().equals(currentUserId);

        if (!isAdmin && !isOwner) {
            throw new BusinessException("Bạn không có quyền thực hiện trên mùa vụ của nông trại này.");
        }
    }

    private SeasonResponse mapToResponse(FarmingSeason season) {
        return SeasonResponse.builder()
                .id(season.getSeasonId())
                .farmId(season.getFarm().getFarmId())
                .farmName(season.getFarm().getFarmName())
                .productId(season.getProduct().getProductId())
                .productCode(season.getProduct().getProductCode())
                .productName(season.getProduct().getProductName())
                .seasonCode(season.getSeasonCode())
                .startDate(season.getStartDate())
                .expectedHarvestDate(season.getExpectedHarvestDate())
                .actualHarvestDate(season.getActualHarvestDate())
                .farmingMethod(season.getFarmingMethod())
                .seasonStatus(season.getSeasonStatus())
                .createdAt(season.getCreatedAt())
                .updatedAt(season.getUpdatedAt())
                .build();
    }
}
