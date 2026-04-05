package com.bicap.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateDriverRequest {

    @NotBlank(message = "driverCode không được để trống")
    private String driverCode;

    @NotBlank(message = "licenseNo không được để trống")
    private String licenseNo;

    @NotNull(message = "userId không được để trống")
    private Long userId;

    private String status;
}
