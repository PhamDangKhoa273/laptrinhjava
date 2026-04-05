package com.bicap.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateDriverRequest {

    @NotBlank(message = "licenseNo không được để trống")
    private String licenseNo;

    private String status;
}
