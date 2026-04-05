package com.bicap.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateFarmSubscriptionRequest {

    @NotNull(message = "packageId không được để trống")
    private Long packageId;

    private LocalDate startDate;
}
