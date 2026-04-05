package com.bicap.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeasonReferenceDto {
    private Long seasonId;
    private Long productId;
    private String seasonCode;
    private String seasonName;
    private String productCode;
    private String productName;
    private String cropName;
    private String farmCode;
    private String farmName;
    private String status;
}
