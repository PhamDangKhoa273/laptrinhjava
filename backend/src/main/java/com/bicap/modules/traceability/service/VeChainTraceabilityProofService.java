package com.bicap.modules.traceability.service;

import com.bicap.modules.batch.entity.BlockchainTransaction;
import com.bicap.modules.batch.service.BlockchainService;
import com.bicap.modules.vechain.service.VeChainProofService;
import org.springframework.stereotype.Service;

@Service
public class VeChainTraceabilityProofService implements TraceabilityProofService {
    private final BlockchainService blockchainService;
    private final VeChainProofService veChainProofService;

    public VeChainTraceabilityProofService(BlockchainService blockchainService,
                                           VeChainProofService veChainProofService) {
        this.blockchainService = blockchainService;
        this.veChainProofService = veChainProofService;
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
        return veChainProofService.commitAndTrack(
                "SEASON_EXPORT",
                seasonId,
                "EXPORT",
                canonicalJson,
                strip0x(canonicalHashHex),
                traceCode
        );
    }

    private String strip0x(String hex) {
        if (hex == null) return null;
        return hex.startsWith("0x") || hex.startsWith("0X") ? hex.substring(2) : hex;
    }
}
