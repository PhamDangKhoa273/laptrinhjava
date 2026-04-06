package com.bicap.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class ProcessTimelineResponse {
    private SeasonInfo seasonInfo;
    private List<ProcessStepResponse> steps;

    @Data
    @Builder
    public static class SeasonInfo {
        private Long seasonId;
        private String seasonName;
        private LocalDate startDate;
        private LocalDate endDate;
        private String status;
    }
}
