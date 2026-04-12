<<<<<<< Updated upstream:backend/src/main/java/com/bicap/backend/repository/QrCodeRepository.java
package com.bicap.backend.repository;

import com.bicap.backend.entity.QrCode;
=======
package com.bicap.modules.batch.repository;
import com.bicap.modules.batch.entity.QrCode;

>>>>>>> Stashed changes:backend/src/main/java/com/bicap/modules/batch/repository/QrCodeRepository.java
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QrCodeRepository extends JpaRepository<QrCode, Long> {
    Optional<QrCode> findByBatch_BatchId(Long batchId);
    Optional<QrCode> findByBatchBatchIdAndStatus(Long batchId, String status);
    boolean existsByBatchBatchIdAndStatus(Long batchId, String status);
}

