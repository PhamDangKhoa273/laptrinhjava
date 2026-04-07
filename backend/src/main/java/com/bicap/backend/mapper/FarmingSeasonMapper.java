package com.bicap.backend.mapper;

import com.bicap.backend.dto.response.FarmingSeasonResponse;
import com.bicap.backend.entity.FarmingSeason;
import org.springframework.stereotype.Component;

@Component
public class FarmingSeasonMapper {

    public FarmingSeasonResponse toResponse(FarmingSeason season) {
        if (season == null) return null;

        return FarmingSeasonResponse.builder()
                .id(season.getSeasonId())
                .farmId(season.getFarm() != null ? season.getFarm().getFarmId() : null)
                .farmName(season.getFarm() != null ? season.getFarm().getFarmName() : null)
                .productId(season.getProduct() != null ? season.getProduct().getProductId() : null)
                .productCode(season.getProduct() != null ? season.getProduct().getProductCode() : null)
                .productName(season.getProduct() != null ? season.getProduct().getProductName() : null)
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
