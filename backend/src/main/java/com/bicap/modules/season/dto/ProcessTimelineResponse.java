package com.bicap.modules.season.dto;

import java.time.LocalDate;
import java.util.List;

public class ProcessTimelineResponse {
    private SeasonInfo season;
    private List<ProcessStepResponse> steps;

    public void setSeason(SeasonInfo s) { this.season = s; }
    public void setSteps(List<ProcessStepResponse> l) { this.steps = l; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private ProcessTimelineResponse r = new ProcessTimelineResponse();
        public Builder seasonInfo(SeasonInfo s) { r.setSeason(s); return this; }
        public Builder steps(List<ProcessStepResponse> l) { r.setSteps(l); return this; }
        public ProcessTimelineResponse build() { return r; }
    }

    public static class SeasonInfo {
        private Long seasonId;
        private String seasonName;
        private LocalDate startDate;
        private LocalDate expectedHarvestDate;
        private String seasonStatus;

        public void setSeasonId(Long id) { this.seasonId = id; }
        public void setSeasonName(String s) { this.seasonName = s; }
        public void setStartDate(LocalDate d) { this.startDate = d; }
        public void setExpectedHarvestDate(LocalDate d) { this.expectedHarvestDate = d; }
        public void setSeasonStatus(String s) { this.seasonStatus = s; }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private SeasonInfo s = new SeasonInfo();
            public Builder seasonId(Long l) { s.setSeasonId(l); return this; }
            public Builder seasonName(String str) { s.setSeasonName(str); return this; }
            public Builder startDate(LocalDate d) { s.setStartDate(d); return this; }
            public Builder expectedHarvestDate(LocalDate d) { s.setExpectedHarvestDate(d); return this; }
            public Builder endDate(LocalDate d) { s.setExpectedHarvestDate(d); return this; }
            public Builder status(String str) { s.setSeasonStatus(str); return this; }
            public Builder seasonStatus(String str) { s.setSeasonStatus(str); return this; }
            public SeasonInfo build() { return s; }
        }
    }
}
