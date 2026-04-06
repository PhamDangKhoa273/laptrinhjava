package com.bicap.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateProcessStepRequest {
    @NotNull(message = "step_no is required")
    private Integer stepNo;

    @NotBlank(message = "step_name is required")
    private String stepName;

    @NotNull(message = "performed_at is required")
    private LocalDateTime performedAt;

    private String description;
    
    private String imageUrl;
}
