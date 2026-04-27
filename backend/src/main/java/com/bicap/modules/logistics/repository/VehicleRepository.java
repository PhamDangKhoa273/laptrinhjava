package com.bicap.modules.logistics.repository;

import com.bicap.modules.logistics.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    boolean existsByPlateNo(String plateNo);
}
