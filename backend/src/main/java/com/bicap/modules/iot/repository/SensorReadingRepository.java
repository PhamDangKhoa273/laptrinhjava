package com.bicap.modules.iot.repository;

import com.bicap.modules.iot.entity.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {
    List<SensorReading> findByFarmOwnerUserUserIdOrderByMeasuredAtDesc(Long userId);
    List<SensorReading> findBySeasonSeasonIdOrderByMeasuredAtDesc(Long seasonId);
    List<SensorReading> findByBatchBatchIdOrderByMeasuredAtDesc(Long batchId);
<<<<<<< HEAD
    List<SensorReading> findAllByMeasuredAtBetween(LocalDateTime start, LocalDateTime end);
=======
    List<SensorReading> findByFarmFarmIdAndMeasuredAtBetween(Long farmId, LocalDateTime from, LocalDateTime to);
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd
}
