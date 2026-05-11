package com.bicap.modules.traceability.service;

import com.bicap.modules.batch.entity.BlockchainTransaction;

public interface TraceabilityProofService {
    String canonicalizeHash(String payload);

    BlockchainTransaction commitSeasonExportProof(String canonicalJson,
                                                  String canonicalHashHex,
                                                  String traceCode,
                                                  Long seasonId);
}
