package com.bicap.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmingSeasonResponse {
    private Long id;
    private Long farmId;
    private String farmName;
    private Long productId;
    private String productCode;
    private String productName;
    private String seasonCode;
    private LocalDate startDate;
    private LocalDate expectedHarvestDate;
    private LocalDate actualHarvestDate;
    private String farmingMethod;
    private String seasonStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Manual Builder as fallback
    public static class FarmingSeasonResponseBuilder {
        private Long id;
        private Long farmId;
        private String farmName;
        private Long productId;
        private String productCode;
        private String productName;
        private String seasonCode;
        private LocalDate startDate;
        private LocalDate expectedHarvestDate;
        private LocalDate actualHarvestDate;
        private String farmingMethod;
        private String seasonStatus;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public FarmingSeasonResponseBuilder id(Long id) { this.id = id; return this; }
        public FarmingSeasonResponseBuilder farmId(Long farmId) { this.farmId = farmId; return this; }
        public FarmingSeasonResponseBuilder farmName(String farmName) { this.farmName = farmName; return this; }
        public FarmingSeasonResponseBuilder productId(Long productId) { this.productId = productId; return this; }
        public FarmingSeasonResponseBuilder productCode(String productCode) { this.productCode = productCode; return this; }
        public FarmingSeasonResponseBuilder productName(String productName) { this.productName = productName; return this; }
        public FarmingSeasonResponseBuilder seasonCode(String seasonCode) { this.seasonCode = seasonCode; return this; }
        public FarmingSeasonResponseBuilder startDate(LocalDate startDate) { this.startDate = startDate; return this; }
        public FarmingSeasonResponseBuilder expectedHarvestDate(LocalDate expectedHarvestDate) { this.expectedHarvestDate = expectedHarvestDate; return this; }
        public FarmingSeasonResponseBuilder actualHarvestDate(LocalDate actualHarvestDate) { this.actualHarvestDate = actualHarvestDate; return this; }
        public FarmingSeasonResponseBuilder farmingMethod(String farmingMethod) { this.farmingMethod = farmingMethod; return this; }
        public FarmingSeasonResponseBuilder seasonStatus(String seasonStatus) { this.seasonStatus = seasonStatus; return this; }
        public FarmingSeasonResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public FarmingSeasonResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public FarmingSeasonResponse build() {
            return new FarmingSeasonResponse(id, farmId, farmName, productId, productCode, productName, seasonCode, startDate, expectedHarvestDate, actualHarvestDate, farmingMethod, seasonStatus, createdAt, updatedAt);
        }
    }

    public static FarmingSeasonResponseBuilder builder() {
        return new FarmingSeasonResponseBuilder();
    }
}
