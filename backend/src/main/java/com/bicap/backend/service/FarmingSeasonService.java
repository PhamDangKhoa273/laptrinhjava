package com.bicap.backend.service;

import com.bicap.backend.dto.request.CreateSeasonRequest;
import com.bicap.backend.dto.request.UpdateSeasonRequest;
import com.bicap.backend.dto.response.FarmingSeasonResponse;
import com.bicap.backend.entity.*;
import com.bicap.backend.enums.RoleName;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.mapper.FarmingSeasonMapper;
import com.bicap.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FarmingSeasonService {

    private final FarmingSeasonRepository farmingSeasonRepository;
    private final FarmRepository farmRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final BlockchainService blockchainService;
    private final BlockchainTransactionRepository blockchainTransactionRepository;
    private final AuditLogService auditLogService;
    private final FarmingSeasonMapper farmingSeasonMapper;

    // Manual Constructor instead of @RequiredArgsConstructor
    public FarmingSeasonService(FarmingSeasonRepository farmingSeasonRepository,
                                FarmRepository farmRepository,
                                ProductRepository productRepository,
                                UserRepository userRepository,
                                UserService userService,
                                BlockchainService blockchainService,
                                BlockchainTransactionRepository blockchainTransactionRepository,
                                AuditLogService auditLogService,
                                FarmingSeasonMapper farmingSeasonMapper) {
        this.farmingSeasonRepository = farmingSeasonRepository;
        this.farmRepository = farmRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.blockchainService = blockchainService;
        this.blockchainTransactionRepository = blockchainTransactionRepository;
        this.auditLogService = auditLogService;
        this.farmingSeasonMapper = farmingSeasonMapper;
    }

    @Transactional
    public FarmingSeasonResponse createSeason(CreateSeasonRequest request, Long currentUserId) {
        // 1. Check if farm exists and is APPROVED
        Farm farm = getFarmAndCheckPermission(request.getFarmId(), currentUserId);
        if (!"APPROVED".equalsIgnoreCase(farm.getApprovalStatus())) {
            throw new BusinessException("Farm chưa được duyệt (status: " + farm.getApprovalStatus() + "). Không thể tạo mùa vụ.");
        }

        // 2. Check if product exists
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy sản phẩm với ID: " + request.getProductId()));

        // 3. Check if expectedHarvestDate >= startDate
        if (request.getExpectedHarvestDate().isBefore(request.getStartDate())) {
            throw new BusinessException("Ngày thu hoạch dự kiến phải sau hoặc bằng ngày bắt đầu.");
        }

        // 4. Check if seasonCode is unique
        if (farmingSeasonRepository.findBySeasonCode(request.getSeasonCode()).isPresent()) {
            throw new BusinessException("Mã mùa vụ '" + request.getSeasonCode() + "' đã tồn tại.");
        }

        // 5. Create Entity
        FarmingSeason season = new FarmingSeason();
        season.setFarm(farm);
        season.setProduct(product);
        season.setSeasonCode(request.getSeasonCode().trim());
        season.setStartDate(request.getStartDate());
        season.setExpectedHarvestDate(request.getExpectedHarvestDate());
        season.setFarmingMethod(request.getFarmingMethod());
        season.setSeasonStatus("PLANNED");

        FarmingSeason saved = farmingSeasonRepository.save(season);

        // 6. Blockchain Integration
        try {
            String txHash = blockchainService.saveSeasonToBlockchain(saved);
            
            // Save to blockchain_transactions table using generic schema
            BlockchainTransaction tx = BlockchainTransaction.builder()
                    .relatedEntityType("SEASON")
                    .relatedEntityId(saved.getSeasonId())
                    .actionType("CREATE")
                    .txHash(txHash)
                    .txStatus("SUCCESS")
                    .build();
            blockchainTransactionRepository.save(tx);
        } catch (Exception e) {
            // Log error but allow creation to proceed if blockchain is down
        }

        auditLogService.log(currentUserId, "CREATE_FARMING_SEASON", "FARMING_SEASON", saved.getSeasonId());

        return farmingSeasonMapper.toResponse(saved);
    }

    @Transactional
    public FarmingSeasonResponse updateSeason(Long seasonId, UpdateSeasonRequest request, Long currentUserId) {
        FarmingSeason season = getSeasonEntityById(seasonId);
        getFarmAndCheckPermission(season.getFarm().getFarmId(), currentUserId);

        // Validations
        if (request.getExpectedHarvestDate().isBefore(request.getStartDate())) {
            throw new BusinessException("Ngày thu hoạch dự kiến phải sau hoặc bằng ngày bắt đầu.");
        }

        // Check if seasonCode is unique (if changed)
        if (!season.getSeasonCode().equals(request.getSeasonCode().trim())) {
            if (farmingSeasonRepository.findBySeasonCode(request.getSeasonCode().trim()).isPresent()) {
                throw new BusinessException("Mã mùa vụ '" + request.getSeasonCode() + "' đã tồn tại.");
            }
        }

        // Update fields
        season.setSeasonCode(request.getSeasonCode().trim());
        season.setStartDate(request.getStartDate());
        season.setExpectedHarvestDate(request.getExpectedHarvestDate());
        season.setActualHarvestDate(request.getActualHarvestDate());
        season.setFarmingMethod(request.getFarmingMethod());

        // Logic: If actualHarvestDate is set, status MUST be HARVESTED
        if (request.getActualHarvestDate() != null) {
            season.setSeasonStatus("HARVESTED");
        } else if (request.getSeasonStatus() != null && !request.getSeasonStatus().isBlank()) {
            season.setSeasonStatus(request.getSeasonStatus().trim().toUpperCase());
        }

        FarmingSeason saved = farmingSeasonRepository.save(season);

        auditLogService.log(currentUserId, "UPDATE_FARMING_SEASON", "FARMING_SEASON", saved.getSeasonId());

        return farmingSeasonMapper.toResponse(saved);
    }

    public FarmingSeasonResponse getSeasonById(Long seasonId) {
        FarmingSeason season = getSeasonEntityById(seasonId);
        return farmingSeasonMapper.toResponse(season);
    }

    public List<FarmingSeasonResponse> getSeasonsByFarmId(Long farmId) {
        List<FarmingSeason> seasons = farmingSeasonRepository.findByFarm_FarmId(farmId);
        return seasons.stream().map(farmingSeasonMapper::toResponse).toList();
    }

    public List<FarmingSeasonResponse> getSeasonsByProductId(Long productId) {
        List<FarmingSeason> seasons = farmingSeasonRepository.findByProduct_ProductId(productId);
        return seasons.stream().map(farmingSeasonMapper::toResponse).toList();
    }

    public List<FarmingSeasonResponse> getAllSeasons() {
        return farmingSeasonRepository.findAll().stream().map(farmingSeasonMapper::toResponse).toList();
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
}
