package com.bicap.modules.iot.repository;

import com.bicap.modules.iot.entity.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {
    List<SensorReading> findByFarmOwnerUserUserIdOrderByMeasuredAtDesc(Long userId);
    List<SensorReading> findBySeasonSeasonIdOrderByMeasuredAtDesc(Long seasonId);
    List<SensorReading> findByBatchBatchIdOrderByMeasuredAtDesc(Long batchId);
}
