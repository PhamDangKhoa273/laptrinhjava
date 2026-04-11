package com.bicap.modules.batch.repository;
import com.bicap.modules.batch.repository.ProductBatchRepository;
import com.bicap.modules.batch.entity.ProductBatch;

import com.bicap.modules.batch.entity.ProductBatch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductBatchRepository extends JpaRepository<ProductBatch, Long> {
    boolean existsByBatchCode(String batchCode);
}

