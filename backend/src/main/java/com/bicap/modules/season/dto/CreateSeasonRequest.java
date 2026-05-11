package com.bicap.modules.season.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class CreateSeasonRequest {
    @NotNull(message = "farm_id is required")
    private Long farmId;

    @NotNull(message = "product_id is required")
    private Long productId;

    @NotBlank(message = "Mã mùa vụ là bắt buộc")
    @Size(max = 100, message = "Mã mùa vụ không được vượt quá 100 ký tự")
    private String seasonCode;

    @NotNull(message = "Ngày bắt đầu là bắt buộc")
    private LocalDate startDate;

    @NotNull(message = "Ngày thu hoạch dự kiến là bắt buộc")
    private LocalDate expectedHarvestDate;

    @NotBlank(message = "Phương pháp canh tác là bắt buộc")
    @Size(max = 255, message = "Phương pháp canh tác không được vượt quá 255 ký tự")
    private String farmingMethod;

    public Long getFarmId() { return farmId; }
    public void setFarmId(Long id) { this.farmId = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long id) { this.productId = id; }
    public String getSeasonCode() { return seasonCode; }
    public void setSeasonCode(String s) { this.seasonCode = s; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate d) { this.startDate = d; }
    public LocalDate getExpectedHarvestDate() { return expectedHarvestDate; }
    public void setExpectedHarvestDate(LocalDate d) { this.expectedHarvestDate = d; }
    public String getFarmingMethod() { return farmingMethod; }
    public void setFarmingMethod(String s) { this.farmingMethod = s; }
}
