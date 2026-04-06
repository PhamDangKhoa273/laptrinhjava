package com.bicap.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ReorderProcessRequest {
    @NotNull(message = "process_ids is required")
    private List<Long> processIds;
}
