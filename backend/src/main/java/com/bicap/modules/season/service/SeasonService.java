package com.bicap.modules.season.service;

import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.batch.dto.SeasonBlockchainPayload;
import com.bicap.modules.batch.service.BlockchainService;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.product.entity.Product;
import com.bicap.modules.product.repository.ProductRepository;
import com.bicap.modules.season.dto.CreateSeasonRequest;
import com.bicap.modules.season.dto.SeasonResponse;
import com.bicap.modules.season.dto.UpdateSeasonRequest;
import com.bicap.modules.season.entity.FarmingSeason;
import com.bicap.modules.season.repository.FarmingSeasonRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class SeasonService {

    private final FarmingSeasonRepository farmingSeasonRepository;
    private final FarmRepository farmRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final BlockchainService blockchainService;

    public SeasonService(FarmingSeasonRepository farmingSeasonRepository,
                         FarmRepository farmRepository,
                         ProductRepository productRepository,
                         UserRepository userRepository,
                         UserService userService,
                         BlockchainService blockchainService) {
        this.farmingSeasonRepository = farmingSeasonRepository;
        this.farmRepository = farmRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.blockchainService = blockchainService;
    }

    public List<SeasonResponse> getAllSeasons() {
        Long currentUserId = com.bicap.core.security.SecurityUtils.getCurrentUserIdOrNull();
        if (currentUserId == null) {
            return farmingSeasonRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
        }

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy người dùng hiện tại."));
        if (userService.hasRole(user, RoleName.ADMIN)) {
            return farmingSeasonRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
        }

        return farmingSeasonRepository.findAll().stream()
                .filter(season -> season.getFarm() != null
                        && season.getFarm().getOwnerUser() != null
                        && currentUserId.equals(season.getFarm().getOwnerUser().getUserId()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<SeasonResponse> getSeasonsByFarmId(Long farmId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy trang trại."));
        Long currentUserId = com.bicap.core.security.SecurityUtils.getCurrentUserIdOrNull();
        if (currentUserId != null) {
            checkPermission(farm, currentUserId);
        }
        return farmingSeasonRepository.findByFarm_FarmId(farmId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<SeasonResponse> getSeasonsByProductId(Long productId) {
        return farmingSeasonRepository.findByProduct_ProductId(productId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public SeasonResponse getSeasonById(Long id) {
        FarmingSeason s = farmingSeasonRepository.findById(id).orElseThrow(() -> new BusinessException("Mùa vụ không tồn tại"));
        return mapToResponse(s);
    }

    public FarmingSeason findSeasonAndCheckPermission(Long seasonId, Long currentUserId) {
        FarmingSeason season = farmingSeasonRepository.findById(seasonId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy mùa vụ."));
        checkPermission(season.getFarm(), currentUserId);
        return season;
    }

    public FarmingSeason getEntityById(Long seasonId) {
        return farmingSeasonRepository.findById(seasonId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy mùa vụ."));
    }

    @Transactional
    public SeasonResponse createSeason(CreateSeasonRequest request, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy người dùng hiện tại."));

        Farm farm;
        if (userService.hasRole(currentUser, RoleName.ADMIN)) {
            farm = farmRepository.findById(request.getFarmId())
                    .orElseThrow(() -> new BusinessException("Không tìm thấy trang trại."));
        } else {
            farm = farmRepository.findByOwnerUser_UserId(currentUserId)
                    .orElseThrow(() -> new BusinessException("Bạn chưa có trang trại được gán."));
            if (request.getFarmId() != null && !farm.getFarmId().equals(request.getFarmId())) {
                throw new BusinessException("Bạn không thể tạo mùa vụ cho trang trại khác.");
            }
        }

        checkPermission(farm, currentUserId);
        validateFarmApproved(farm);
        validateSeasonDates(request.getStartDate(), request.getExpectedHarvestDate(), null, null);
        ensureSeasonCodeUnique(request.getSeasonCode(), null);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException("Sản phẩm không tồn tại."));

        FarmingSeason season = new FarmingSeason();
        season.setFarm(farm);
        season.setProduct(product);
        season.setSeasonCode(request.getSeasonCode());
        season.setStartDate(request.getStartDate());
        season.setExpectedHarvestDate(request.getExpectedHarvestDate());
        season.setFarmingMethod(request.getFarmingMethod());
        season.setSeasonStatus("PLANNED");

        FarmingSeason saved = farmingSeasonRepository.save(season);

        SeasonBlockchainPayload payload = SeasonBlockchainPayload.builder()
                .seasonId(saved.getSeasonId())
                .seasonCode(saved.getSeasonCode())
                .farmId(saved.getFarm().getFarmId())
                .productId(saved.getProduct().getProductId())
                .startDate(saved.getStartDate())
                .farmingMethod(saved.getFarmingMethod())
                .build();
        blockchainService.saveSeason(payload);

        return mapToResponse(saved);
    }

    @Transactional
    public SeasonResponse updateSeason(Long id, UpdateSeasonRequest request, Long currentUserId) {
        FarmingSeason season = farmingSeasonRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Mùa vụ không tồn tại"));
        checkPermission(season.getFarm(), currentUserId);
        String nextSeasonCode = request.getSeasonCode() != null ? request.getSeasonCode() : season.getSeasonCode();
        java.time.LocalDate nextStartDate = request.getStartDate() != null ? request.getStartDate() : season.getStartDate();
        java.time.LocalDate nextExpectedHarvestDate = request.getExpectedHarvestDate() != null ? request.getExpectedHarvestDate() : season.getExpectedHarvestDate();
        java.time.LocalDate nextActualHarvestDate = request.getActualHarvestDate() != null ? request.getActualHarvestDate() : season.getActualHarvestDate();
        String nextFarmingMethod = request.getFarmingMethod() != null ? request.getFarmingMethod() : season.getFarmingMethod();
        String nextSeasonStatus = request.getSeasonStatus() != null ? request.getSeasonStatus() : season.getSeasonStatus();

        validateSeasonDates(nextStartDate, nextExpectedHarvestDate, nextActualHarvestDate, nextSeasonStatus);
        ensureSeasonCodeUnique(nextSeasonCode, id);

        season.setSeasonCode(nextSeasonCode);
        season.setStartDate(nextStartDate);
        season.setExpectedHarvestDate(nextExpectedHarvestDate);
        season.setActualHarvestDate(nextActualHarvestDate);
        season.setFarmingMethod(nextFarmingMethod);
        season.setSeasonStatus(nextSeasonStatus);
        return mapToResponse(farmingSeasonRepository.save(season));
    }

    private void checkPermission(Farm farm, Long currentUserId) {
        if (farm.getOwnerUser() == null || !farm.getOwnerUser().getUserId().equals(currentUserId)) {
            User user = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new BusinessException("Không tìm thấy người dùng hiện tại."));
            if (!userService.hasRole(user, RoleName.ADMIN)) {
                throw new BusinessException("Bạn không có quyền.");
            }
        }
    }

    private void validateFarmApproved(Farm farm) {
        if (!"APPROVED".equalsIgnoreCase(farm.getApprovalStatus())) {
            throw new BusinessException("Chỉ trang trại đã được duyệt mới được tạo mùa vụ.");
        }
    }

    private void validateSeasonDates(java.time.LocalDate startDate,
                                     java.time.LocalDate expectedHarvestDate,
                                     java.time.LocalDate actualHarvestDate,
                                     String seasonStatus) {
        if (startDate != null && expectedHarvestDate != null && expectedHarvestDate.isBefore(startDate)) {
            throw new BusinessException("Ngày thu hoạch dự kiến phải lớn hơn hoặc bằng ngày bắt đầu.");
        }
        if (actualHarvestDate != null) {
            if (startDate != null && actualHarvestDate.isBefore(startDate)) {
                throw new BusinessException("Ngày thu hoạch thực tế không hợp lệ.");
            }
            if (seasonStatus == null || !("HARVESTED".equalsIgnoreCase(seasonStatus) || "COMPLETED".equalsIgnoreCase(seasonStatus))) {
                throw new BusinessException("Chỉ được nhập ngày thu hoạch thực tế khi mùa vụ đã thu hoạch.");
            }
        }
    }

    private void ensureSeasonCodeUnique(String seasonCode, Long currentSeasonId) {
        if (seasonCode == null || seasonCode.isBlank()) {
            throw new BusinessException("Mã mùa vụ không được để trống.");
        }
        farmingSeasonRepository.findBySeasonCode(seasonCode)
                .filter(existing -> currentSeasonId == null || !existing.getSeasonId().equals(currentSeasonId))
                .ifPresent(existing -> {
                    throw new BusinessException("Mã mùa vụ đã tồn tại.");
                });
    }

    private SeasonResponse mapToResponse(FarmingSeason season) {
        return SeasonResponse.builder()
                .id(season.getSeasonId())
                .farmId(season.getFarm().getFarmId())
                .farmName(season.getFarm().getFarmName())
                .productId(season.getProduct() != null ? season.getProduct().getProductId() : null)
                .productCode(season.getProduct() != null ? season.getProduct().getProductCode() : null)
                .productName(season.getProduct() != null ? season.getProduct().getProductName() : null)
                .seasonCode(season.getSeasonCode())
                .seasonStatus(season.getSeasonStatus())
                .startDate(season.getStartDate())
                .expectedHarvestDate(season.getExpectedHarvestDate())
                .actualHarvestDate(season.getActualHarvestDate())
                .farmingMethod(season.getFarmingMethod())
                .createdAt(season.getCreatedAt())
                .updatedAt(season.getUpdatedAt())
                .build();
    }
}
