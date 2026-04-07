package com.bicap.backend.dto.response;

import com.bicap.backend.entity.FarmingProcess;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProcessStepResponse {
    private Long processId;
    private Long seasonId;
    private Integer stepNo;
    private String stepName;
    private LocalDateTime performedAt;
    private String description;
    private String imageUrl;
    private Long recordedByUserId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String txHash;

    public static ProcessStepResponse fromEntity(FarmingProcess process, String paramTxHash) {
        return ProcessStepResponse.builder()
                .processId(process.getId())
                .seasonId(process.getSeason().getId())
                .stepNo(process.getStepNo())
                .stepName(process.getStepName())
                .performedAt(process.getPerformedAt())
                .description(process.getDescription())
                .imageUrl(process.getImageUrl())
                .recordedByUserId(process.getRecordedBy() != null ? process.getRecordedBy().getUserId() : null)
                .createdAt(process.getCreatedAt())
                .updatedAt(process.getUpdatedAt())
                .txHash(paramTxHash)
                .build();
    }
}
