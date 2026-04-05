package com.bicap.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FarmReviewRequest {

    @NotBlank(message = "approvalStatus là bắt buộc")
    private String approvalStatus;

    private String certificationStatus;
}
