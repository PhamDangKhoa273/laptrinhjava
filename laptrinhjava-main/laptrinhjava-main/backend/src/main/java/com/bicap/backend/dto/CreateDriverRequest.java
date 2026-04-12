package com.bicap.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDriverRequest {

    @NotBlank(message = "driverCode không được để trống")
    private String driverCode;

    @NotBlank(message = "licenseNo không được để trống")
    private String licenseNo;

    @NotNull(message = "userId không được để trống")
    private Long userId;

    private String status;

    public String getDriverCode() { return driverCode; }
    public String getLicenseNo() { return licenseNo; }
    public Long getUserId() { return userId; }
    public String getStatus() { return status; }
}
