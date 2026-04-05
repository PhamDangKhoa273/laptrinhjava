package com.bicap.backend.repository;

import com.bicap.backend.entity.ProductBatch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductBatchRepository extends JpaRepository<ProductBatch, Long> {
    boolean existsByBatchCode(String batchCode);
}

