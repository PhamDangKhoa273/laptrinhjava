package com.bicap.modules.batch.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VerifyTraceResponse {
    private Long batchId;
    private String localHash;
    private String onChainHash;
    private boolean matched;
}
