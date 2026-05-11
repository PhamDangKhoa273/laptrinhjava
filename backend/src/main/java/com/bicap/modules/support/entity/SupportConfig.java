package com.bicap.modules.support.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "support_config")
public class SupportConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "config_id")
    private Long configId;

    @Column(name = "telegram_handle", length = 120)
    private String telegramHandle;

    @Column(name = "telegram_display", length = 120)
    private String telegramDisplay;

    @Column(name = "zalo_phone", length = 40)
    private String zaloPhone;

    @Column(name = "zalo_display", length = 120)
    private String zaloDisplay;

    @Column(name = "facebook_url", length = 255)
    private String facebookUrl;

    @Column(name = "instagram_url", length = 255)
    private String instagramUrl;

    @Column(name = "tiktok_url", length = 255)
    private String tiktokUrl;

    @Column(name = "youtube_url", length = 255)
    private String youtubeUrl;

    @Column(name = "linkedin_url", length = 255)
    private String linkedinUrl;

    @Column(name = "x_url", length = 255)
    private String twitterUrl;

    @Column(name = "website_url", length = 255)
    private String websiteUrl;

    @Column(name = "messenger_url", length = 255)
    private String messengerUrl;

    @Column(name = "whatsapp_url", length = 255)
    private String whatsappUrl;

    @Column(length = 160)
    private String email;

    @Column(length = 40)
    private String hotline;

    @Column(name = "working_hours", length = 160)
    private String workingHours;

    @Column(length = 500)
    private String note;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void touch() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getConfigId() { return configId; }
    public void setConfigId(Long configId) { this.configId = configId; }
    public String getTelegramHandle() { return telegramHandle; }
    public void setTelegramHandle(String telegramHandle) { this.telegramHandle = telegramHandle; }
    public String getTelegramDisplay() { return telegramDisplay; }
    public void setTelegramDisplay(String telegramDisplay) { this.telegramDisplay = telegramDisplay; }
    public String getZaloPhone() { return zaloPhone; }
    public void setZaloPhone(String zaloPhone) { this.zaloPhone = zaloPhone; }
    public String getZaloDisplay() { return zaloDisplay; }
    public void setZaloDisplay(String zaloDisplay) { this.zaloDisplay = zaloDisplay; }
    public String getFacebookUrl() { return facebookUrl; }
    public void setFacebookUrl(String facebookUrl) { this.facebookUrl = facebookUrl; }
    public String getInstagramUrl() { return instagramUrl; }
    public void setInstagramUrl(String instagramUrl) { this.instagramUrl = instagramUrl; }
    public String getTiktokUrl() { return tiktokUrl; }
    public void setTiktokUrl(String tiktokUrl) { this.tiktokUrl = tiktokUrl; }
    public String getYoutubeUrl() { return youtubeUrl; }
    public void setYoutubeUrl(String youtubeUrl) { this.youtubeUrl = youtubeUrl; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
    public String getTwitterUrl() { return twitterUrl; }
    public void setTwitterUrl(String twitterUrl) { this.twitterUrl = twitterUrl; }
    public String getWebsiteUrl() { return websiteUrl; }
    public void setWebsiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; }
    public String getMessengerUrl() { return messengerUrl; }
    public void setMessengerUrl(String messengerUrl) { this.messengerUrl = messengerUrl; }
    public String getWhatsappUrl() { return whatsappUrl; }
    public void setWhatsappUrl(String whatsappUrl) { this.whatsappUrl = whatsappUrl; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getHotline() { return hotline; }
    public void setHotline(String hotline) { this.hotline = hotline; }
    public String getWorkingHours() { return workingHours; }
    public void setWorkingHours(String workingHours) { this.workingHours = workingHours; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
