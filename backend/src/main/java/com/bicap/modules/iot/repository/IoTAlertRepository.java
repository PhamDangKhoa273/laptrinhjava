package com.bicap.modules.iot.repository;

import com.bicap.modules.iot.entity.IoTAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IoTAlertRepository extends JpaRepository<IoTAlert, Long> {
    List<IoTAlert> findTop50ByBatchIdOrderByCreatedAtDesc(Long batchId);
}
