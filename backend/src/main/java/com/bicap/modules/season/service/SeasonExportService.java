package com.bicap.modules.season.service;

import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.common.notification.service.NotificationDispatcher;
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
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@lombok.extern.slf4j.Slf4j
public class SeasonExportService {

    private final SeasonExportRepository exportRepository;
    private final FarmingSeasonRepository seasonRepository;
    private final SeasonService seasonService;
    private final UserRepository userRepository;
    private final UserService userService;
    private final QrCodeService qrCodeService;
    private final NotificationDispatcher notificationDispatcher;
    private final TraceabilityProofService traceabilityProofService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public SeasonExportService(SeasonExportRepository exportRepository,
                              FarmingSeasonRepository seasonRepository,
                              SeasonService seasonService,
                              UserRepository userRepository,
                              UserService userService,
                              QrCodeService qrCodeService,
                              NotificationDispatcher notificationDispatcher,
                              TraceabilityProofService traceabilityProofService) {
        this.exportRepository = exportRepository;
        this.seasonRepository = seasonRepository;
        this.seasonService = seasonService;
        this.userRepository = userRepository;
        this.userService = userService;
        this.qrCodeService = qrCodeService;
        this.notificationDispatcher = notificationDispatcher;
        this.traceabilityProofService = traceabilityProofService;
    }

    @Transactional(noRollbackFor = Throwable.class)
    @CacheEvict(value = "publicTrace", allEntries = true)
    public SeasonExportResponse exportSeason(Long seasonId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        try {
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

        // Save export record first with placeholder txHash — blockchain commit happens after.
        String qrImageBase64 = qrCodeService.generateBase64Png(publicTraceUrl);
        SeasonExport export = exportRepository.findTopBySeason_SeasonIdOrderByExportedAtDesc(season.getSeasonId())
                .orElse(new SeasonExport());
        export.setSeason(season);
        export.setTraceCode(traceCode);
        export.setPublicTraceUrl(publicTraceUrl);
        export.setDataHash(dataHash);
        export.setVechainTxId("PENDING-" + strip0x(dataHash));
        export.setPayloadJson(canonicalJson);
        export.setQrImageBase64(qrImageBase64);
        export.setExportedAt(LocalDateTime.now());
        export.setCreatedByUserId(currentUserId);
        SeasonExport saved = exportRepository.save(export);

        // Notifications — use NotificationDispatcher (NOT_SUPPORTED propagation) to avoid
        // marking the outer transaction rollback-only if notification fails.
        if (season.getFarm() != null && season.getFarm().getOwnerUser() != null) {
            try {
                notificationDispatcher.send(
                        season.getFarm().getOwnerUser().getUserId(), null,
                        "Mùa vụ đã xuất thành công",
                        "Mùa vụ " + season.getSeasonCode() + " đã được export. Trace code: " + traceCode,
                        "SEASON_EXPORT", null, null);
            } catch (Exception ignored) { }
        }
        try {
            notificationDispatcher.send(
                    null, "ADMIN",
                    "Farm vừa xuất mùa vụ",
                    "Farm " + (season.getFarm() != null ? season.getFarm().getFarmName() : "N/A")
                            + " đã export mùa vụ " + season.getSeasonCode() + ". Trace: " + traceCode,
                    "SEASON_EXPORT", null, null);
        } catch (Exception ignored) { }

        // Blockchain commit is best-effort — runs AFTER the export is saved so any Error
        // from devkit/web3j does not roll back the export record.
        String txStatus = "PENDING";
        String txNote = "Blockchain commit deferred";
        try {
            BlockchainTransaction veChainTx = traceabilityProofService.commitSeasonExportProof(
                    canonicalJson, dataHash, traceCode, season.getSeasonId());
            txStatus = veChainTx != null ? veChainTx.getTxStatus() : "UNKNOWN";
            txNote = veChainTx != null ? veChainTx.getGovernanceNote() : "";
            // Update export with real txHash.
            saved.setVechainTxId(veChainTx != null ? veChainTx.getTxHash() : saved.getVechainTxId());
            exportRepository.save(saved);
        } catch (Throwable e) {
            txStatus = "FAILED";
            txNote = normalizeError(e);
            saved.setVechainTxId("FAILED-" + strip0x(dataHash));
            try { exportRepository.save(saved); } catch (Exception ignored) { }
        }

        return toResponse(saved, txStatus, txNote);
        } catch (Throwable t) {
            log.error("exportSeason FAILED seasonId={}: {}", seasonId, t.getMessage(), t);
            throw t;
        }
    }

    private String strip0x(String hex) {
        if (hex == null) return null;
        return hex.startsWith("0x") || hex.startsWith("0X") ? hex.substring(2) : hex;
    }

    private String normalizeError(Throwable e) {
        String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
        msg = msg.replaceAll("\\s+", " ").trim();
        return msg.length() > 500 ? msg.substring(0, 500) : msg;
    }

    public SeasonExportResponse getLatestExport(Long seasonId) {
        SeasonExport export = exportRepository.findTopBySeason_SeasonIdOrderByExportedAtDesc(seasonId)
                .orElseThrow(() -> new BusinessException("Mùa vụ này chưa có export."));
        return toResponse(export, null, null);
    }

    @Cacheable(value = "publicTrace", key = "'season-export:' + #traceCode")
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
