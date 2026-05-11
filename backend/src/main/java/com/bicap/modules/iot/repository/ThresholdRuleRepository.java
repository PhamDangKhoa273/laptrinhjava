package com.bicap.modules.iot.repository;

import com.bicap.modules.iot.entity.ThresholdRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ThresholdRuleRepository extends JpaRepository<ThresholdRule, Long> {
    List<ThresholdRule> findByFarmOwnerUserUserId(Long userId);
    List<ThresholdRule> findByFarmFarmIdAndEnabledTrue(Long farmId);
}
