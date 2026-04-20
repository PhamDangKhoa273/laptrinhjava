package com.bicap.modules.iot.repository;

import com.bicap.modules.iot.entity.IoTReading;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IoTReadingRepository extends JpaRepository<IoTReading, Long> {
    List<IoTReading> findTop50ByBatchIdOrderByCapturedAtDesc(Long batchId);
}
