package com.bicap.modules.support.service;

import com.bicap.modules.support.dto.SupportConfigRequest;
import com.bicap.modules.support.dto.SupportConfigResponse;
import com.bicap.modules.support.entity.SupportConfig;
import com.bicap.modules.support.repository.SupportConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SupportConfigService {

    private static final String DEFAULT_TELEGRAM = "bicap_support";
    private static final String DEFAULT_TELEGRAM_DISPLAY = "@bicap_support";
    private static final String DEFAULT_EMAIL = "support@bicap.vn";
    private static final String DEFAULT_HOTLINE = "1900 1009";
    private static final String DEFAULT_WORKING_HOURS = "Thu 2 - Thu 7, 8:00 - 18:00";
    private static final String DEFAULT_NOTE = "Doi ngu BICAP se phan hoi trong vong 30 phut vao gio hanh chinh.";

    private final SupportConfigRepository supportConfigRepository;

    public SupportConfigService(SupportConfigRepository supportConfigRepository) {
        this.supportConfigRepository = supportConfigRepository;
    }

    public SupportConfigResponse get() {
        return toResponse(loadOrDefault());
    }

    @Transactional
    public SupportConfigResponse update(SupportConfigRequest request) {
        SupportConfig config = loadOrDefault();
        config.setTelegramHandle(normalizeHandle(request.getTelegramHandle()));
        config.setTelegramDisplay(trimToNull(request.getTelegramDisplay()));
        config.setZaloPhone(normalizePhone(request.getZaloPhone()));
        config.setZaloDisplay(trimToNull(request.getZaloDisplay()));
        config.setFacebookUrl(normalizeUrl(request.getFacebookUrl()));
        config.setInstagramUrl(normalizeUrl(request.getInstagramUrl()));
        config.setTiktokUrl(normalizeUrl(request.getTiktokUrl()));
        config.setYoutubeUrl(normalizeUrl(request.getYoutubeUrl()));
        config.setLinkedinUrl(normalizeUrl(request.getLinkedinUrl()));
        config.setTwitterUrl(normalizeUrl(request.getTwitterUrl()));
        config.setWebsiteUrl(normalizeUrl(request.getWebsiteUrl()));
        config.setMessengerUrl(normalizeUrl(request.getMessengerUrl()));
        config.setWhatsappUrl(normalizeUrl(request.getWhatsappUrl()));
        config.setEmail(trimToNull(request.getEmail()));
        config.setHotline(trimToNull(request.getHotline()));
        config.setWorkingHours(trimToNull(request.getWorkingHours()));
        config.setNote(trimToNull(request.getNote()));
        return toResponse(supportConfigRepository.save(config));
    }

    private SupportConfig loadOrDefault() {
        return supportConfigRepository.findAll().stream().findFirst().orElseGet(() -> {
            SupportConfig config = new SupportConfig();
            config.setTelegramHandle(DEFAULT_TELEGRAM);
            config.setTelegramDisplay(DEFAULT_TELEGRAM_DISPLAY);
            config.setEmail(DEFAULT_EMAIL);
            config.setHotline(DEFAULT_HOTLINE);
            config.setWorkingHours(DEFAULT_WORKING_HOURS);
            config.setNote(DEFAULT_NOTE);
            return supportConfigRepository.save(config);
        });
    }

    private SupportConfigResponse toResponse(SupportConfig config) {
        SupportConfigResponse response = new SupportConfigResponse();
        response.setTelegramHandle(config.getTelegramHandle());
        response.setTelegramDisplay(config.getTelegramDisplay());
        response.setTelegramLink(buildTelegramLink(config.getTelegramHandle()));
        response.setZaloPhone(config.getZaloPhone());
        response.setZaloDisplay(config.getZaloDisplay());
        response.setZaloLink(buildZaloLink(config.getZaloPhone()));
        response.setFacebookUrl(config.getFacebookUrl());
        response.setInstagramUrl(config.getInstagramUrl());
        response.setTiktokUrl(config.getTiktokUrl());
        response.setYoutubeUrl(config.getYoutubeUrl());
        response.setLinkedinUrl(config.getLinkedinUrl());
        response.setTwitterUrl(config.getTwitterUrl());
        response.setWebsiteUrl(config.getWebsiteUrl());
        response.setMessengerUrl(config.getMessengerUrl());
        response.setWhatsappUrl(config.getWhatsappUrl());
        response.setEmail(config.getEmail());
        response.setHotline(config.getHotline());
        response.setWorkingHours(config.getWorkingHours());
        response.setNote(config.getNote());
        response.setUpdatedAt(config.getUpdatedAt());
        return response;
    }

    private String normalizeUrl(String url) {
        String value = trimToNull(url);
        if (value == null) return null;
        if (value.startsWith("http://") || value.startsWith("https://")) return value;
        return "https://" + value;
    }

    private String normalizeHandle(String handle) {
        String value = trimToNull(handle);
        if (value == null) return null;
        if (value.startsWith("http")) return value;
        return value.startsWith("@") ? value.substring(1) : value;
    }

    private String normalizePhone(String phone) {
        String value = trimToNull(phone);
        if (value == null) return null;
        if (value.startsWith("http")) return value;
        return value.replaceAll("\\s+", "");
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String buildTelegramLink(String handle) {
        if (handle == null || handle.isBlank()) return null;
        if (handle.startsWith("http")) return handle;
        return "https://t.me/" + handle.replaceAll("^@", "");
    }

    private String buildZaloLink(String phone) {
        if (phone == null || phone.isBlank()) return null;
        if (phone.startsWith("http")) return phone;
        String digits = phone.replaceAll("\\D", "");
        if (digits.isEmpty()) return null;
        return "https://zalo.me/" + digits;
    }
}
