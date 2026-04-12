package com.bicap.backend.dto.trace;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class QrCodeResponse {
    private Long qrCodeId;
    private Long batchId;
    private String qrValue;
    private String qrUrl;
    private String qrImageBase64;
    private String status;
    private LocalDateTime generatedAt;
}

