package com.bicap.modules.support.dto;

import jakarta.validation.constraints.Size;

public class SupportConfigRequest {

    @Size(max = 120)
    private String telegramHandle;

    @Size(max = 120)
    private String telegramDisplay;

    @Size(max = 40)
    private String zaloPhone;

    @Size(max = 120)
    private String zaloDisplay;

    @Size(max = 255)
    private String facebookUrl;

    @Size(max = 255)
    private String instagramUrl;

    @Size(max = 255)
    private String tiktokUrl;

    @Size(max = 255)
    private String youtubeUrl;

    @Size(max = 255)
    private String linkedinUrl;

    @Size(max = 255)
    private String twitterUrl;

    @Size(max = 255)
    private String websiteUrl;

    @Size(max = 255)
    private String messengerUrl;

    @Size(max = 255)
    private String whatsappUrl;

    @Size(max = 160)
    private String email;

    @Size(max = 40)
    private String hotline;

    @Size(max = 160)
    private String workingHours;

    @Size(max = 500)
    private String note;

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
}
