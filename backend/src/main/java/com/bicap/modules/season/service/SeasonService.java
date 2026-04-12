package com.bicap.modules.season.service;

import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.product.entity.Product;
import com.bicap.modules.product.repository.ProductRepository;
import com.bicap.modules.season.dto.CreateSeasonRequest;
import com.bicap.modules.season.dto.SeasonResponse;
import com.bicap.modules.season.dto.UpdateSeasonRequest;
import com.bicap.modules.season.entity.FarmingSeason;
import com.bicap.modules.season.repository.FarmingSeasonRepository;
import com.bicap.core.exception.BusinessException;
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
                .orElseThrow(() -> new BusinessException("Không tìm thấy trang trại"));

        checkPermission(farm, currentUserId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy sản phẩm"));

        FarmingSeason season = new FarmingSeason();
        season.setFarm(farm);
        season.setProduct(product);
        season.setSeasonCode(request.getSeasonCode());
        season.setStartDate(request.getStartDate());
        season.setExpectedHarvestDate(request.getExpectedHarvestDate());
        season.setFarmingMethod(request.getFarmingMethod());
        season.setSeasonStatus("CREATED");

        FarmingSeason saved = farmingSeasonRepository.save(season);
        return mapToResponse(saved);
    }

    @Transactional
    public SeasonResponse updateSeason(Long id, UpdateSeasonRequest request, Long currentUserId) {
        FarmingSeason season = farmingSeasonRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Mùa vụ không tồn tại"));

        checkPermission(season.getFarm(), currentUserId);

        season.setSeasonCode(request.getSeasonCode());
        season.setStartDate(request.getStartDate());
        season.setExpectedHarvestDate(request.getExpectedHarvestDate());
        season.setActualHarvestDate(request.getActualHarvestDate());
        season.setFarmingMethod(request.getFarmingMethod());
        season.setSeasonStatus(request.getSeasonStatus());

        FarmingSeason saved = farmingSeasonRepository.save(season);
        return mapToResponse(saved);
    }

    private void checkPermission(Farm farm, Long currentUserId) {
        if (!farm.getOwnerUser().getUserId().equals(currentUserId)) {
            throw new BusinessException("Bạn không có quyền thực hiện thao tác trên trang trại này");
        }
    }

    private SeasonResponse mapToResponse(FarmingSeason s) {
        return SeasonResponse.builder()
                .id(s.getSeasonId())
                .farmId(s.getFarm().getFarmId())
                .farmName(s.getFarm().getFarmName())
                .productId(s.getProduct().getProductId())
                .productCode(s.getProduct().getProductCode())
                .productName(s.getProduct().getProductName())
                .seasonCode(s.getSeasonCode())
                .startDate(s.getStartDate())
                .expectedHarvestDate(s.getExpectedHarvestDate())
                .actualHarvestDate(s.getActualHarvestDate())
                .farmingMethod(s.getFarmingMethod())
                .seasonStatus(s.getSeasonStatus())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
