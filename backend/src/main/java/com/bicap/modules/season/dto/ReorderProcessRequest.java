package com.bicap.modules.season.dto;

import java.util.List;

public class ReorderProcessRequest {
    private List<Long> processIds;

    public List<Long> getProcessIds() { return processIds; }
    public void setProcessIds(List<Long> list) { this.processIds = list; }
}
