package com.bicap.modules.season.service;

import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
import com.bicap.core.service.BlockchainService;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.product.entity.Product;
import com.bicap.modules.product.repository.ProductRepository;
import com.bicap.modules.season.dto.CreateSeasonRequest;
import com.bicap.modules.season.dto.SeasonResponse;
import com.bicap.modules.season.dto.UpdateSeasonRequest;
import com.bicap.modules.season.entity.FarmingSeason;
import com.bicap.modules.season.repository.FarmingProcessRepository;
import com.bicap.modules.season.repository.FarmingSeasonRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SeasonService {

    private static final Set<String> ALLOWED_STATUSES = Set.of("PLANNED", "IN_PROGRESS", "HARVESTED", "COMPLETED");
    private static final Set<String> MUTABLE_STATUSES = Set.of("PLANNED", "IN_PROGRESS", "HARVESTED");

    private final FarmingSeasonRepository farmingSeasonRepository;
    private final FarmingProcessRepository farmingProcessRepository;
    private final FarmRepository farmRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final BlockchainService blockchainService;

    public SeasonService(FarmingSeasonRepository farmingSeasonRepository,
                         FarmingProcessRepository farmingProcessRepository,
                         FarmRepository farmRepository,
                         ProductRepository productRepository,
                         UserRepository userRepository,
                         UserService userService,
                         BlockchainService blockchainService) {
        this.farmingSeasonRepository = farmingSeasonRepository;
        this.farmingProcessRepository = farmingProcessRepository;
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
        FarmingSeason season = farmingSeasonRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Mùa vụ không tồn tại"));
        Long currentUserId = com.bicap.core.security.SecurityUtils.getCurrentUserIdOrNull();
        if (currentUserId != null) {
            checkPermission(season.getFarm(), currentUserId);
        }
        return mapToResponse(season);
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

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException("Sản phẩm không tồn tại."));

        String normalizedSeasonCode = normalizeSeasonCode(request.getSeasonCode());
        String normalizedFarmingMethod = normalizeText(request.getFarmingMethod(), "Phương pháp canh tác không được để trống.");

        validateSeasonDates(request.getStartDate(), request.getExpectedHarvestDate(), null, "PLANNED");
        ensureSeasonCodeUnique(normalizedSeasonCode, null);

        FarmingSeason season = new FarmingSeason();
        season.setFarm(farm);
        season.setProduct(product);
        season.setSeasonCode(normalizedSeasonCode);
        season.setStartDate(request.getStartDate());
        season.setExpectedHarvestDate(request.getExpectedHarvestDate());
        season.setFarmingMethod(normalizedFarmingMethod);
        season.setSeasonStatus("PLANNED");

        FarmingSeason saved = farmingSeasonRepository.save(season);

        // Gọi Hàm chờ Blockchain Middleware (Giai đoạn 4)
        String txHash = blockchainService.sendToVeChain(saved);
        saved.setTxHash(txHash);
        saved.setBlockchainStatus("PENDING");
        saved.setContractAddress("0x-fake-contract-address");
        farmingSeasonRepository.save(saved); // Cập nhật trạng thái sau khi đã có hash

        return mapToResponse(saved);
    }

    @Transactional
    public SeasonResponse updateSeason(Long id, UpdateSeasonRequest request, Long currentUserId) {
        FarmingSeason season = farmingSeasonRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Mùa vụ không tồn tại"));
        checkPermission(season.getFarm(), currentUserId);
        ensureSeasonMutable(season);

        String nextSeasonCode = request.getSeasonCode() != null
                ? normalizeSeasonCode(request.getSeasonCode())
                : season.getSeasonCode();
        LocalDate nextStartDate = request.getStartDate() != null ? request.getStartDate() : season.getStartDate();
        LocalDate nextExpectedHarvestDate = request.getExpectedHarvestDate() != null ? request.getExpectedHarvestDate() : season.getExpectedHarvestDate();
        LocalDate nextActualHarvestDate = request.getActualHarvestDate() != null ? request.getActualHarvestDate() : season.getActualHarvestDate();
        String nextFarmingMethod = request.getFarmingMethod() != null
                ? normalizeText(request.getFarmingMethod(), "Phương pháp canh tác không được để trống.")
                : season.getFarmingMethod();
        String nextSeasonStatus = request.getSeasonStatus() != null
                ? normalizeStatus(request.getSeasonStatus())
                : season.getSeasonStatus();

        validateSeasonStatusTransition(season.getSeasonStatus(), nextSeasonStatus, season);
        validateSeasonDates(nextStartDate, nextExpectedHarvestDate, nextActualHarvestDate, nextSeasonStatus);
        ensureSeasonCodeUnique(nextSeasonCode, id);
        validateProcessDatesWithinSeason(id, nextStartDate, nextActualHarvestDate, nextSeasonStatus);

        season.setSeasonCode(nextSeasonCode);
        season.setStartDate(nextStartDate);
        season.setExpectedHarvestDate(nextExpectedHarvestDate);
        season.setActualHarvestDate(nextActualHarvestDate);
        season.setFarmingMethod(nextFarmingMethod);
        season.setSeasonStatus(nextSeasonStatus);
        return mapToResponse(farmingSeasonRepository.save(season));
    }

    public void ensureProcessMutationAllowed(FarmingSeason season) {
        ensureSeasonMutable(season);
        String status = normalizeStatus(season.getSeasonStatus());
        if ("PLANNED".equals(status)) {
            throw new BusinessException("Mùa vụ đang ở trạng thái PLANNED, hãy chuyển sang IN_PROGRESS trước khi cập nhật nhật ký quy trình.");
        }
    }

    public void validateProcessDateAgainstSeason(FarmingSeason season, LocalDateTime performedAt) {
        if (performedAt == null) {
            throw new BusinessException("Thời điểm thực hiện không được để trống.");
        }
        if (season.getStartDate() != null && performedAt.toLocalDate().isBefore(season.getStartDate())) {
            throw new BusinessException("Thời điểm thực hiện không được trước ngày bắt đầu mùa vụ.");
        }
        if (season.getActualHarvestDate() != null && performedAt.toLocalDate().isAfter(season.getActualHarvestDate())) {
            throw new BusinessException("Thời điểm thực hiện không được sau ngày thu hoạch thực tế.");
        }
        if (season.getExpectedHarvestDate() != null
                && performedAt.toLocalDate().isAfter(season.getExpectedHarvestDate())
                && season.getActualHarvestDate() == null
                && !"HARVESTED".equalsIgnoreCase(season.getSeasonStatus())
                && !"COMPLETED".equalsIgnoreCase(season.getSeasonStatus())) {
            throw new BusinessException("Thời điểm thực hiện vượt quá ngày thu hoạch dự kiến. Hãy cập nhật trạng thái mùa vụ trước.");
        }
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

    private void validateSeasonDates(LocalDate startDate,
                                     LocalDate expectedHarvestDate,
                                     LocalDate actualHarvestDate,
                                     String seasonStatus) {
        if (startDate == null || expectedHarvestDate == null) {
            throw new BusinessException("Ngày bắt đầu và ngày thu hoạch dự kiến là bắt buộc.");
        }
        if (expectedHarvestDate.isBefore(startDate)) {
            throw new BusinessException("Ngày thu hoạch dự kiến phải lớn hơn hoặc bằng ngày bắt đầu.");
        }
        String normalizedStatus = normalizeStatus(seasonStatus == null ? "PLANNED" : seasonStatus);
        if (actualHarvestDate != null) {
            if (actualHarvestDate.isBefore(startDate)) {
                throw new BusinessException("Ngày thu hoạch thực tế không hợp lệ.");
            }
            if (actualHarvestDate.isAfter(LocalDate.now().plusYears(1))) {
                throw new BusinessException("Ngày thu hoạch thực tế vượt quá giới hạn hợp lý.");
            }
            if (!("HARVESTED".equals(normalizedStatus) || "COMPLETED".equals(normalizedStatus))) {
                throw new BusinessException("Chỉ được nhập ngày thu hoạch thực tế khi mùa vụ đã thu hoạch hoặc hoàn tất.");
            }
        }
        if ("COMPLETED".equals(normalizedStatus) && actualHarvestDate == null) {
            throw new BusinessException("Mùa vụ COMPLETED phải có ngày thu hoạch thực tế.");
        }
    }

    private void validateSeasonStatusTransition(String currentStatus, String nextStatus, FarmingSeason season) {
        String current = normalizeStatus(currentStatus == null ? "PLANNED" : currentStatus);
        String next = normalizeStatus(nextStatus == null ? current : nextStatus);

        if (!ALLOWED_STATUSES.contains(next)) {
            throw new BusinessException("Trạng thái mùa vụ không hợp lệ.");
        }
        if (current.equals(next)) {
            return;
        }
        if ("PLANNED".equals(current) && !("IN_PROGRESS".equals(next) || "PLANNED".equals(next))) {
            throw new BusinessException("Mùa vụ PLANNED chỉ có thể chuyển sang IN_PROGRESS.");
        }
        if ("IN_PROGRESS".equals(current) && !("HARVESTED".equals(next) || "IN_PROGRESS".equals(next))) {
            throw new BusinessException("Mùa vụ IN_PROGRESS chỉ có thể chuyển sang HARVESTED.");
        }
        if ("HARVESTED".equals(current) && !("COMPLETED".equals(next) || "HARVESTED".equals(next))) {
            throw new BusinessException("Mùa vụ HARVESTED chỉ có thể chuyển sang COMPLETED.");
        }
        if ("COMPLETED".equals(current)) {
            throw new BusinessException("Mùa vụ COMPLETED không thể cập nhật lại.");
        }
        if ("HARVESTED".equals(next) && farmingProcessRepository.findBySeason_SeasonIdOrderByStepNoAsc(season.getSeasonId()).isEmpty()) {
            throw new BusinessException("Mùa vụ phải có ít nhất một bước quy trình trước khi chuyển sang HARVESTED.");
        }
    }

    private void validateProcessDatesWithinSeason(Long seasonId,
                                                  LocalDate nextStartDate,
                                                  LocalDate nextActualHarvestDate,
                                                  String nextSeasonStatus) {
        List<LocalDateTime> processDates = farmingProcessRepository.findBySeason_SeasonIdOrderByPerformedAtAsc(seasonId).stream()
                .map(process -> process.getPerformedAt())
                .toList();

        if (processDates.isEmpty()) {
            return;
        }

        LocalDate earliestProcessDate = processDates.get(0).toLocalDate();
        LocalDate latestProcessDate = processDates.get(processDates.size() - 1).toLocalDate();

        if (earliestProcessDate.isBefore(nextStartDate)) {
            throw new BusinessException("Không thể cập nhật ngày bắt đầu sau nhật ký quy trình đầu tiên.");
        }
        if (nextActualHarvestDate != null && latestProcessDate.isAfter(nextActualHarvestDate)) {
            throw new BusinessException("Không thể cập nhật ngày thu hoạch thực tế trước nhật ký quy trình cuối cùng.");
        }
        if ("PLANNED".equals(nextSeasonStatus)) {
            throw new BusinessException("Mùa vụ đã có nhật ký quy trình, không thể chuyển lại PLANNED.");
        }
    }

    private void ensureSeasonCodeUnique(String seasonCode, Long currentSeasonId) {
        farmingSeasonRepository.findBySeasonCode(seasonCode)
                .filter(existing -> currentSeasonId == null || !existing.getSeasonId().equals(currentSeasonId))
                .ifPresent(existing -> {
                    throw new BusinessException("Mã mùa vụ đã tồn tại.");
                });
    }

    private void ensureSeasonMutable(FarmingSeason season) {
        String status = normalizeStatus(season.getSeasonStatus());
        if (!MUTABLE_STATUSES.contains(status)) {
            throw new BusinessException("Mùa vụ ở trạng thái " + status + " không thể cập nhật nữa.");
        }
    }

    private SeasonResponse mapToResponse(FarmingSeason season) {
        List<com.bicap.modules.season.entity.FarmingProcess> processes = farmingProcessRepository.findBySeason_SeasonIdOrderByPerformedAtAsc(season.getSeasonId());
        LocalDateTime latestProcessAt = processes.isEmpty() ? null : processes.get(processes.size() - 1).getPerformedAt();

        return SeasonResponse.builder()
                .id(season.getSeasonId())
                .farmId(season.getFarm().getFarmId())
                .farmName(season.getFarm().getFarmName())
                .productId(season.getProduct() != null ? season.getProduct().getProductId() : null)
                .productCode(season.getProduct() != null ? season.getProduct().getProductCode() : null)
                .productName(season.getProduct() != null ? season.getProduct().getProductName() : null)
                .seasonCode(season.getSeasonCode())
                .seasonStatus(season.getSeasonStatus())
                .processCount(processes.size())
                .latestProcessAt(latestProcessAt)
                .startDate(season.getStartDate())
                .expectedHarvestDate(season.getExpectedHarvestDate())
                .actualHarvestDate(season.getActualHarvestDate())
                .farmingMethod(season.getFarmingMethod())
                .createdAt(season.getCreatedAt())
                .updatedAt(season.getUpdatedAt())
                .build();
    }

    private String normalizeSeasonCode(String seasonCode) {
        return normalizeText(seasonCode, "Mã mùa vụ không được để trống.")
                .toUpperCase(Locale.ROOT)
                .replaceAll("\\s+", "-");
    }

    private String normalizeStatus(String seasonStatus) {
        return normalizeText(seasonStatus, "Trạng thái mùa vụ không được để trống.").toUpperCase(Locale.ROOT);
    }

    private String normalizeText(String value, String message) {
        if (value == null) {
            throw new BusinessException(message);
        }
        String normalized = value.trim().replaceAll("\\s+", " ");
        if (normalized.isBlank()) {
            throw new BusinessException(message);
        }
        return normalized;
    }
}
