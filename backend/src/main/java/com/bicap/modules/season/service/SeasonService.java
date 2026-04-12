package com.bicap.modules.season.service;

import com.bicap.modules.user.entity.User;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.batch.service.BlockchainService;
import com.bicap.modules.user.service.UserService;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.season.repository.FarmingSeasonRepository;
import com.bicap.modules.season.entity.FarmingSeason;
import com.bicap.modules.product.entity.Product;
import com.bicap.modules.product.repository.ProductRepository;
import com.bicap.modules.season.dto.CreateSeasonRequest;
import com.bicap.modules.season.dto.UpdateSeasonRequest;
import com.bicap.modules.season.dto.SeasonResponse;
import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
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
        return farmingSeasonRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<SeasonResponse> getSeasonsByFarmId(Long farmId) {
        return farmingSeasonRepository.findByFarm_FarmId(farmId).stream().map(this::mapToResponse).collect(Collectors.toList());
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

    @Transactional
    public SeasonResponse createSeason(CreateSeasonRequest request, Long currentUserId) {
        Farm farm = farmRepository.findById(request.getFarmId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy trang trại."));
        checkPermission(farm, currentUserId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException("Sản phẩm không tồn tại."));

        FarmingSeason season = new FarmingSeason();
        season.setFarm(farm);
        season.setProduct(product);
        season.setSeasonCode(request.getSeasonCode());
        season.setStartDate(request.getStartDate());
        season.setExpectedHarvestDate(request.getExpectedHarvestDate());
        season.setSeasonStatus("PLANNED");

        FarmingSeason saved = farmingSeasonRepository.save(season);
        blockchainService.saveSeason(saved);
        return mapToResponse(saved);
    }

    @Transactional
    public SeasonResponse updateSeason(Long id, UpdateSeasonRequest request, Long currentUserId) {
        FarmingSeason season = farmingSeasonRepository.findById(id).orElseThrow(() -> new BusinessException("Mùa vụ không tồn tại"));
        checkPermission(season.getFarm(), currentUserId);
        season.setSeasonCode(request.getSeasonCode());
        season.setStartDate(request.getStartDate());
        season.setExpectedHarvestDate(request.getExpectedHarvestDate());
        season.setSeasonStatus(request.getSeasonStatus());
        return mapToResponse(farmingSeasonRepository.save(season));
    }

    private void checkPermission(Farm farm, Long currentUserId) {
        if (farm.getOwnerUser() == null || !farm.getOwnerUser().getUserId().equals(currentUserId)) {
            User user = userRepository.findById(currentUserId).get();
            if (!userService.hasRole(user, RoleName.ADMIN)) {
                throw new BusinessException("Bạn không có quyền.");
            }
        }
    }

    private SeasonResponse mapToResponse(FarmingSeason season) {
        return SeasonResponse.builder()
                .id(season.getSeasonId())
                .farmId(season.getFarm().getFarmId())
                .farmName(season.getFarm().getFarmName())
                .seasonCode(season.getSeasonCode())
                .seasonStatus(season.getSeasonStatus())
                .startDate(season.getStartDate())
                .expectedHarvestDate(season.getExpectedHarvestDate())
                .build();
    }
}
