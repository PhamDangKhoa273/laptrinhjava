package com.bicap.modules.traceability.service;

import com.bicap.modules.batch.entity.BlockchainTransaction;
import com.bicap.modules.batch.service.BlockchainService;
import com.bicap.core.enums.BlockchainGovernanceStatus;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Stub implementation used when VECHAIN_THOR_ENABLED=false.
 * Returns a DISABLED tx record so the export flow completes without
 * touching the devkit/web3j stack (which has a Guava version mismatch
 * in the current demo environment — tracked as GAP-001).
 */
@Service
@ConditionalOnProperty(name = "vechain.thor.enabled", havingValue = "false", matchIfMissing = false)
public class StubTraceabilityProofService implements TraceabilityProofService {

    private final BlockchainService blockchainService;

    public StubTraceabilityProofService(BlockchainService blockchainService) {
        this.blockchainService = blockchainService;
    }

    @Override
    public String canonicalizeHash(String payload) {
        return blockchainService.canonicalizeHash(payload);
    }

    @Override
    public BlockchainTransaction commitSeasonExportProof(String canonicalJson,
                                                         String canonicalHashHex,
                                                         String traceCode,
                                                         Long seasonId) {
        BlockchainTransaction tx = new BlockchainTransaction();
        tx.setRelatedEntityType("SEASON_EXPORT");
        tx.setRelatedEntityId(seasonId);
        tx.setActionType("EXPORT");
        tx.setDataPayload(canonicalJson);
        tx.setTxHash("STUB-" + strip0x(canonicalHashHex).substring(0, Math.min(16, strip0x(canonicalHashHex).length())));
        tx.setTxStatus("DISABLED");
        tx.setGovernanceStatus(BlockchainGovernanceStatus.GOVERNED);
        tx.setGovernanceNote("VeChainThor disabled (GAP-001). Payload hash stored in DB only.");
        tx.setCreatedAt(LocalDateTime.now());
        return tx;
    }

    private String strip0x(String hex) {
        if (hex == null) return "0000000000000000";
        return hex.startsWith("0x") || hex.startsWith("0X") ? hex.substring(2) : hex;
    }
}
