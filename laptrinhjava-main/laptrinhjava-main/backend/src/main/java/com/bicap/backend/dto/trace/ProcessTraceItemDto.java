package com.bicap.backend.dto.trace;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessTraceItemDto {
    private String processCode;
    private String processName;
    private String stage;
    private String status;
    private LocalDate processDate;
    private String operatorName;
    private String notes;
    private LocalDateTime recordedAt;
}

