package com.bicap.modules.media.dto;

import java.time.LocalDateTime;

public class MediaFileResponse {
    private Long mediaFileId;
    private String fileUrl;
    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private String entityType;
    private Long entityId;
    private LocalDateTime createdAt;

    public Long getMediaFileId() { return mediaFileId; }
    public void setMediaFileId(Long mediaFileId) { this.mediaFileId = mediaFileId; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
