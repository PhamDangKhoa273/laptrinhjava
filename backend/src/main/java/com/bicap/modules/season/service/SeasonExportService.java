package com.bicap.modules.season.service;

import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.common.notification.dto.CreateNotificationRequest;
import com.bicap.modules.common.notification.service.NotificationService;
import com.bicap.modules.batch.entity.BlockchainTransaction;
import com.bicap.modules.batch.service.QrCodeService;
import com.bicap.modules.batch.util.HashUtils;
import com.bicap.modules.season.dto.SeasonExportResponse;
import com.bicap.modules.season.entity.FarmingSeason;
import com.bicap.modules.season.entity.SeasonExport;
import com.bicap.modules.season.repository.SeasonExportRepository;
import com.bicap.modules.season.repository.FarmingSeasonRepository;
import com.bicap.modules.traceability.service.TraceabilityProofService;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class SeasonExportService {

    private final SeasonExportRepository exportRepository;
    private final FarmingSeasonRepository seasonRepository;
    private final SeasonService seasonService;
    private final UserRepository userRepository;
    private final UserService userService;
    private final QrCodeService qrCodeService;
    private final NotificationService notificationService;
    private final TraceabilityProofService traceabilityProofService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public SeasonExportService(SeasonExportRepository exportRepository,
                              FarmingSeasonRepository seasonRepository,
                              SeasonService seasonService,
                              UserRepository userRepository,
                              UserService userService,
                              QrCodeService qrCodeService,
                              NotificationService notificationService,
                              TraceabilityProofService traceabilityProofService) {
        this.exportRepository = exportRepository;
        this.seasonRepository = seasonRepository;
        this.seasonService = seasonService;
        this.userRepository = userRepository;
        this.userService = userService;
        this.qrCodeService = qrCodeService;
        this.notificationService = notificationService;
        this.traceabilityProofService = traceabilityProofService;
    }

    @Transactional
    public SeasonExportResponse exportSeason(Long seasonId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        FarmingSeason season = seasonRepository.findById(seasonId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy mùa vụ."));

        // Permission: FARM owner or ADMIN
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy người dùng hiện tại."));
        if (!userService.hasRole(user, RoleName.ADMIN)) {
            seasonService.findSeasonAndCheckPermission(seasonId, currentUserId);
        }

        if (season.getFarm() == null || season.getFarm().getApprovalStatus() == null
                || !"APPROVED".equalsIgnoreCase(season.getFarm().getApprovalStatus())) {
            throw new BusinessException("Chỉ trang trại đã được duyệt mới được export mùa vụ.");
        }

        String traceCode = buildTraceCode(season);
        String publicTraceUrl = buildPublicTraceUrl(traceCode);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("type", "SEASON_EXPORT");
        payload.put("seasonId", season.getSeasonId());
        payload.put("seasonCode", season.getSeasonCode());
        payload.put("farmId", season.getFarm() != null ? season.getFarm().getFarmId() : null);
        payload.put("productId", season.getProduct() != null ? season.getProduct().getProductId() : null);
        payload.put("seasonStatus", season.getSeasonStatus());
        payload.put("startDate", season.getStartDate());
        payload.put("expectedHarvestDate", season.getExpectedHarvestDate());
        payload.put("actualHarvestDate", season.getActualHarvestDate());
        payload.put("farmingMethod", season.getFarmingMethod());
        payload.put("exportedAt", LocalDateTime.now());
        payload.put("publicTraceUrl", publicTraceUrl);

        String canonicalJson = HashUtils.toCanonicalJson(payload);
        String dataHash = traceabilityProofService.canonicalizeHash(canonicalJson);

        SeasonExport existingExport = exportRepository.findTopBySeason_SeasonIdAndDataHashOrderByExportedAtDesc(season.getSeasonId(), dataHash)
                .orElse(null);
        if (existingExport != null) {
            return toResponse(existingExport, "DEDUPED", "Duplicate export payload, reusing latest persisted export record.");
        }

        BlockchainTransaction veChainTx = null;
        try {
            veChainTx = traceabilityProofService.commitSeasonExportProof(
                    canonicalJson,
                    dataHash,
                    traceCode,
                    season.getSeasonId()
            );
        } catch (Exception e) {
            veChainTx = new BlockchainTransaction();
            veChainTx.setRelatedEntityType("SEASON_EXPORT");
            veChainTx.setRelatedEntityId(season.getSeasonId());
            veChainTx.setActionType("EXPORT");
            veChainTx.setTxHash("FAILED-" + strip0x(dataHash));
            veChainTx.setTxStatus("FAILED");
            veChainTx.setGovernanceStatus(com.bicap.core.enums.BlockchainGovernanceStatus.FAILED);
            veChainTx.setGovernanceNote(normalizeError(e));
            veChainTx.setCreatedAt(LocalDateTime.now());
        }

        String qrImageBase64 = qrCodeService.generateBase64Png(publicTraceUrl);

        SeasonExport export = exportRepository.findTopBySeason_SeasonIdOrderByExportedAtDesc(season.getSeasonId())
                .orElse(new SeasonExport());
        export.setSeason(season);
        export.setTraceCode(traceCode);
        export.setPublicTraceUrl(publicTraceUrl);
        export.setDataHash(dataHash);
        export.setVechainTxId(veChainTx.getTxHash());
        export.setPayloadJson(canonicalJson);
        export.setQrImageBase64(qrImageBase64);
        export.setExportedAt(LocalDateTime.now());
        export.setCreatedByUserId(currentUserId);

        SeasonExport saved = exportRepository.save(export);

        // Notifications
        if (season.getFarm() != null && season.getFarm().getOwnerUser() != null) {
            CreateNotificationRequest farmNotification = new CreateNotificationRequest();
            farmNotification.setRecipientUserId(season.getFarm().getOwnerUser().getUserId());
            farmNotification.setTitle("Season exported");
            farmNotification.setMessage("Mùa vụ " + season.getSeasonCode() + " đã được export. Trace: " + traceCode);
            farmNotification.setNotificationType("SEASON_EXPORT");
            farmNotification.setTargetType("SEASON_EXPORT");
            farmNotification.setTargetId(saved.getExportId());
            notificationService.create(farmNotification);
        }

        CreateNotificationRequest adminNotification = new CreateNotificationRequest();
        adminNotification.setRecipientRole("ADMIN");
        adminNotification.setTitle("Season export created");
        adminNotification.setMessage("Farm " + (season.getFarm() != null ? season.getFarm().getFarmName() : "N/A")
                + " đã export mùa vụ " + season.getSeasonCode() + ". Trace: " + traceCode);
        adminNotification.setNotificationType("SEASON_EXPORT");
        adminNotification.setTargetType("SEASON_EXPORT");
        adminNotification.setTargetId(saved.getExportId());
        notificationService.create(adminNotification);

        return toResponse(saved, veChainTx.getTxStatus(), veChainTx.getGovernanceNote());
    }

    private String strip0x(String hex) {
        if (hex == null) return null;
        return hex.startsWith("0x") || hex.startsWith("0X") ? hex.substring(2) : hex;
    }

    private String normalizeError(Exception e) {
        String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
        msg = msg.replaceAll("\\s+", " ").trim();
        return msg.length() > 500 ? msg.substring(0, 500) : msg;
    }

    public SeasonExportResponse getLatestExport(Long seasonId) {
        SeasonExport export = exportRepository.findTopBySeason_SeasonIdOrderByExportedAtDesc(seasonId)
                .orElseThrow(() -> new BusinessException("Mùa vụ này chưa có export."));
        return toResponse(export, null, null);
    }

    public SeasonExportResponse getByTraceCode(String traceCode) {
        SeasonExport export = exportRepository.findByTraceCode(traceCode)
                .orElseThrow(() -> new BusinessException("Không tìm thấy export theo traceCode."));
        return toResponse(export, null, null);
    }

    private SeasonExportResponse toResponse(SeasonExport export, String txStatus, String receiptNote) {
        FarmingSeason season = export.getSeason();
        return SeasonExportResponse.builder()
                .exportId(export.getExportId())
                .seasonId(season.getSeasonId())
                .seasonCode(season.getSeasonCode())
                .traceCode(export.getTraceCode())
                .publicTraceUrl(export.getPublicTraceUrl())
                .farmName(season.getFarm() != null ? season.getFarm().getFarmName() : null)
                .farmProvince(season.getFarm() != null ? season.getFarm().getProvince() : null)
                .productName(season.getProduct() != null ? season.getProduct().getProductName() : null)
                .productImageUrl(season.getProduct() != null ? season.getProduct().getImageUrl() : null)
                .seasonStatus(season.getSeasonStatus())
                .dataHash(export.getDataHash())
                .vechainTxId(export.getVechainTxId())
                .vechainTxStatus(txStatus)
                .vechainReceiptNote(receiptNote)
                .qrImageBase64(export.getQrImageBase64())
                .exportedAt(export.getExportedAt())
                .build();
    }

    private String buildTraceCode(FarmingSeason season) {
        return ("TRACE-SEASON-" + season.getSeasonId()).toUpperCase();
    }

    private String buildPublicTraceUrl(String traceCode) {
        String normalizedFrontend = frontendUrl != null ? frontendUrl.trim() : "http://localhost:5173";
        if (normalizedFrontend.endsWith("/")) {
            normalizedFrontend = normalizedFrontend.substring(0, normalizedFrontend.length() - 1);
        }
        return normalizedFrontend + "/public/trace?traceCode=" + traceCode;
    }
}
