package com.bicap.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDriverRequest {

    @NotBlank(message = "licenseNo không được để trống")
    private String licenseNo;

    private String status;

    public String getLicenseNo() { return licenseNo; }
    public String getStatus() { return status; }
}
