package com.bicap.modules.batch.repository;

import com.bicap.modules.batch.entity.QrCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QrCodeRepository extends JpaRepository<QrCode, Long> {
    Optional<QrCode> findByBatch_BatchId(Long batchId);
    Optional<QrCode> findByBatchBatchIdAndStatus(Long batchId, String status);
    boolean existsByBatchBatchIdAndStatus(Long batchId, String status);
}

