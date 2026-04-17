package com.bicap.modules.batch.dto;

import java.util.List;

public class TraceBatchResponse {
    private BatchResponse batch;
    private QrCodeResponse qrInfo;
    private List<ProcessTraceItemDto> timeline;
    private TraceSeasonInfoDto seasonInfo;
    private List<TraceProcessStepDto> processList;
    private String note;

    public BatchResponse getBatch() { return batch; }
    public void setBatch(BatchResponse batch) { this.batch = batch; }
    public QrCodeResponse getQrInfo() { return qrInfo; }
    public void setQrInfo(QrCodeResponse qrInfo) { this.qrInfo = qrInfo; }
    public List<ProcessTraceItemDto> getTimeline() { return timeline; }
    public void setTimeline(List<ProcessTraceItemDto> timeline) { this.timeline = timeline; }
    public TraceSeasonInfoDto getSeasonInfo() { return seasonInfo; }
    public void setSeasonInfo(TraceSeasonInfoDto seasonInfo) { this.seasonInfo = seasonInfo; }
    public List<TraceProcessStepDto> getProcessList() { return processList; }
    public void setProcessList(List<TraceProcessStepDto> processList) { this.processList = processList; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final TraceBatchResponse response = new TraceBatchResponse();

        public Builder batch(BatchResponse batch) { response.setBatch(batch); return this; }
        public Builder qrInfo(QrCodeResponse qrInfo) { response.setQrInfo(qrInfo); return this; }
        public Builder seasonInfo(TraceSeasonInfoDto seasonInfo) { response.setSeasonInfo(seasonInfo); return this; }
        public Builder processList(List<TraceProcessStepDto> processList) { response.setProcessList(processList); return this; }
        public Builder timeline(List<ProcessTraceItemDto> timeline) { response.setTimeline(timeline); return this; }
        public Builder note(String note) { response.setNote(note); return this; }
        public TraceBatchResponse build() { return response; }
    }
}
