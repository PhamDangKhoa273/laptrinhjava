package com.bicap.modules.contract.repository;

import com.bicap.modules.contract.entity.FarmRetailerContract;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FarmRetailerContractRepository extends JpaRepository<FarmRetailerContract, Long> {
    List<FarmRetailerContract> findByFarmIdOrderByCreatedAtDesc(Long farmId);
    List<FarmRetailerContract> findByRetailerIdOrderByCreatedAtDesc(Long retailerId);
    List<FarmRetailerContract> findByFarmIdAndStatusOrderByCreatedAtDesc(Long farmId, String status);
    List<FarmRetailerContract> findByRetailerIdAndStatusOrderByCreatedAtDesc(Long retailerId, String status);
}
