package com.bicap.modules.common.report.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.core.service.SecurityAuditService;
import com.bicap.modules.common.report.dto.CreatePlatformReportRequest;
import com.bicap.modules.common.report.dto.PlatformReportResponse;
import com.bicap.modules.common.report.dto.UpdatePlatformReportStatusRequest;
import com.bicap.modules.common.report.entity.PlatformReport;
import com.bicap.modules.common.report.repository.PlatformReportRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class PlatformReportService {

    private final PlatformReportRepository platformReportRepository;
    private final UserRepository userRepository;
    private final SecurityAuditService securityAuditService;

    public PlatformReportService(PlatformReportRepository platformReportRepository, UserRepository userRepository, SecurityAuditService securityAuditService) {
        this.platformReportRepository = platformReportRepository;
        this.userRepository = userRepository;
        this.securityAuditService = securityAuditService;
    }

    @Transactional
    public PlatformReportResponse create(CreatePlatformReportRequest request) {
        if ((request.getRecipientUserId() == null && (request.getRecipientRole() == null || request.getRecipientRole().isBlank()))
                || (request.getRecipientUserId() != null && request.getRecipientRole() != null && !request.getRecipientRole().isBlank())) {
            throw new BusinessException("Phải chỉ định đúng một đích nhận report: recipientUserId hoặc recipientRole");
        }

        User reporter = userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy người gửi report"));

        PlatformReport report = new PlatformReport();
        report.setReporterUser(reporter);
        if (request.getRecipientUserId() != null) {
            User recipient = userRepository.findById(request.getRecipientUserId())
                    .orElseThrow(() -> new BusinessException("Không tìm thấy người nhận report"));
            report.setRecipientUser(recipient);
        } else {
            report.setRecipientRole(request.getRecipientRole().trim().toUpperCase());
        }
        report.setReportType(request.getReportType().trim().toUpperCase());
        report.setSubject(request.getSubject().trim());
        report.setContent(request.getContent().trim());
        report.setStatus("OPEN");
        report.setRelatedEntityType(request.getRelatedEntityType() != null ? request.getRelatedEntityType().trim().toUpperCase() : null);
        report.setRelatedEntityId(request.getRelatedEntityId());

        PlatformReportResponse response = toResponse(platformReportRepository.save(report));
        securityAuditService.logAdminAction(SecurityUtils.getCurrentUserIdOrNull(), "REPORT_CREATE", String.valueOf(response.getReportId()), response.getStatus());
        return response;
    }

    public List<PlatformReportResponse> getMyReports() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy người dùng hiện tại"));

        List<PlatformReportResponse> responses = new ArrayList<>();
        platformReportRepository.findByReporterUserUserIdOrderByCreatedAtDesc(currentUserId)
                .stream()
                .map(this::toResponse)
                .forEach(responses::add);

        currentUser.getRoles().forEach(role -> platformReportRepository.findByRecipientRoleOrderByCreatedAtDesc(role.getRoleName())
                .stream()
                .map(this::toResponse)
                .forEach(responses::add));

        responses.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return responses;
    }

    public List<PlatformReportResponse> getAdminReports() {
        return platformReportRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public PlatformReportResponse updateStatus(Long reportId, UpdatePlatformReportStatusRequest request) {
        PlatformReport report = platformReportRepository.findById(reportId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy report"));
        String status = request.getStatus().trim().toUpperCase();
        if (!List.of("OPEN", "IN_REVIEW", "ESCALATED", "RESOLVED", "CLOSED").contains(status)) {
            throw new BusinessException("Trạng thái report không hợp lệ");
        }
        report.setStatus(status);
        PlatformReportResponse response = toResponse(platformReportRepository.save(report));
        securityAuditService.logAdminAction(SecurityUtils.getCurrentUserIdOrNull(), "REPORT_STATUS_CHANGE", String.valueOf(reportId), status);
        return response;
    }

    private PlatformReportResponse toResponse(PlatformReport report) {
        PlatformReportResponse response = new PlatformReportResponse();
        response.setReportId(report.getReportId());
        response.setReporterUserId(report.getReporterUser().getUserId());
        response.setReporterName(report.getReporterUser().getFullName());
        response.setRecipientUserId(report.getRecipientUser() != null ? report.getRecipientUser().getUserId() : null);
        response.setRecipientRole(report.getRecipientRole());
        response.setReportType(report.getReportType());
        response.setSubject(report.getSubject());
        response.setContent(report.getContent());
        response.setStatus(report.getStatus());
        response.setRelatedEntityType(report.getRelatedEntityType());
        response.setRelatedEntityId(report.getRelatedEntityId());
        response.setCreatedAt(report.getCreatedAt());
        response.setUpdatedAt(report.getUpdatedAt());
        return response;
    }
}
