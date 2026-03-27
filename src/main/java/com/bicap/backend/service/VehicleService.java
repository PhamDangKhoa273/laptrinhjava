package com.bicap.backend.service;

import com.bicap.backend.entity.User;
import com.bicap.backend.entity.Vehicle;
import com.bicap.backend.enums.RoleName;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.UserRepository;
import com.bicap.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public Vehicle createVehicle(Vehicle vehicle, Long managerUserId) {
        User manager = userRepository.findById(managerUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy manager"));

        if (!userService.hasRole(manager, RoleName.SHIPPING_MANAGER)) {
            throw new BusinessException("manager_user_id phải là SHIPPING_MANAGER");
        }

        if (vehicleRepository.existsByPlateNo(vehicle.getPlateNo())) {
            throw new BusinessException("Biển số xe đã tồn tại");
        }

        vehicle.setManagerUser(manager);
        return vehicleRepository.save(vehicle);
    }

    public List<Vehicle> getAll() {
        return vehicleRepository.findAll();
    }

    public Vehicle getById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy vehicle"));
    }

    public Vehicle update(Long id, Vehicle request, Long managerUserId) {
        Vehicle vehicle = getById(id);

        User manager = userRepository.findById(managerUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy manager"));

        if (!userService.hasRole(manager, RoleName.SHIPPING_MANAGER)) {
            throw new BusinessException("manager_user_id phải là SHIPPING_MANAGER");
        }

        if (!vehicle.getPlateNo().equalsIgnoreCase(request.getPlateNo())
                && vehicleRepository.existsByPlateNo(request.getPlateNo())) {
            throw new BusinessException("Biển số xe đã tồn tại");
        }

        vehicle.setManagerUser(manager);
        vehicle.setPlateNo(request.getPlateNo());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setCapacity(request.getCapacity());
        vehicle.setStatus(request.getStatus());

        return vehicleRepository.save(vehicle);
    }
}