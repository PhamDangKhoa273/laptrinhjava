package com.bicap.backend.repository;

import com.bicap.backend.entity.ProductBatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductBatchRepository extends JpaRepository<ProductBatch, Long> {
    boolean existsByBatchCode(String batchCode);
    List<ProductBatch> findByFarmFarmId(Long farmId);
    List<ProductBatch> findBySeasonId(Long seasonId);
}
