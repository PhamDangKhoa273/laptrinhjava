package com.bicap.modules.season.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "farming_processes")
public class FarmingProcess {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "process_id")
    private Long processId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "season_id")
    private FarmingSeason season;

    private Integer stepNo;
    
    @Column(name = "step_name")
    private String processName;
    
    private String description;
    private LocalDateTime performedAt;
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by_user_id")
    private com.bicap.modules.user.entity.User recordedBy;

    // Getters and Setters
    public Long getProcessId() { return processId; }
    public void setProcessId(Long id) { this.processId = id; }
    public Long getId() { return processId; }
    public void setId(Long id) { this.processId = id; }

    public String getProcessName() { return processName; }
    public void setProcessName(String s) { this.processName = s; }
    public String getStepName() { return processName; }
    public void setStepName(String s) { this.processName = s; }

    public Integer getStepNo() { return stepNo; }
    public void setStepNo(Integer i) { this.stepNo = i; }
    public String getDescription() { return description; }
    public void setDescription(String s) { this.description = s; }
    public LocalDateTime getPerformedAt() { return performedAt; }
    public void setPerformedAt(LocalDateTime t) { this.performedAt = t; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String s) { this.imageUrl = s; }
    
    public FarmingSeason getSeason() { return season; }
    public void setSeason(FarmingSeason s) { this.season = s; }
    
    public com.bicap.modules.user.entity.User getRecordedBy() { return recordedBy; }
    public void setRecordedBy(com.bicap.modules.user.entity.User u) { this.recordedBy = u; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private FarmingProcess p = new FarmingProcess();
        public Builder processId(Long id) { p.setProcessId(id); return this; }
        public Builder season(FarmingSeason s) { p.setSeason(s); return this; }
        public Builder stepNo(Integer i) { p.setStepNo(i); return this; }
        public Builder processName(String s) { p.setProcessName(s); return this; }
        public Builder stepName(String s) { p.setProcessName(s); return this; }
        public Builder description(String s) { p.setDescription(s); return this; }
        public Builder performedAt(LocalDateTime t) { p.setPerformedAt(t); return this; }
        public Builder imageUrl(String s) { p.setImageUrl(s); return this; }
        public Builder recordedBy(com.bicap.modules.user.entity.User u) { p.setRecordedBy(u); return this; }
        public FarmingProcess build() { return p; }
    }
}
