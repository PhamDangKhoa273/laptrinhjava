package com.bicap.backend.service;

import com.bicap.backend.dto.CreateVehicleRequest;
import com.bicap.backend.dto.UpdateVehicleRequest;
import com.bicap.backend.dto.VehicleResponse;
import com.bicap.backend.entity.User;
import com.bicap.backend.entity.Vehicle;
import com.bicap.backend.enums.RoleName;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.UserRepository;
import com.bicap.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;

    @Transactional
    public VehicleResponse createVehicle(CreateVehicleRequest request, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user hiện tại"));

        if (!userService.hasRole(currentUser, RoleName.SHIPPING_MANAGER)) {
            throw new BusinessException("Chỉ SHIPPING_MANAGER mới được tạo vehicle");
        }

        if (vehicleRepository.existsByPlateNo(request.getPlateNo().trim())) {
            throw new BusinessException("Biển số xe đã tồn tại");
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setManagerUser(currentUser);
        vehicle.setPlateNo(request.getPlateNo().trim());
        vehicle.setVehicleType(request.getVehicleType().trim());
        vehicle.setCapacity(request.getCapacity());
        vehicle.setStatus(normalizeStatus(request.getStatus()));

        Vehicle saved = vehicleRepository.save(vehicle);

        auditLogService.log(currentUserId, "CREATE_VEHICLE", "VEHICLE", saved.getVehicleId());

        return toResponse(saved);
    }

    public List<VehicleResponse> getAll() {
        return vehicleRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public VehicleResponse getById(Long id) {
        return toResponse(getEntityById(id));
    }

    @Transactional
    public VehicleResponse update(Long id, UpdateVehicleRequest request, Long currentUserId) {
        Vehicle vehicle = getEntityById(id);
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user hiện tại"));

        boolean isAdmin = userService.hasRole(currentUser, RoleName.ADMIN);
        boolean isManagerOwner = vehicle.getManagerUser() != null
                && vehicle.getManagerUser().getUserId().equals(currentUserId);

        if (!isAdmin && !isManagerOwner) {
            throw new BusinessException("Bạn không có quyền cập nhật vehicle này");
        }

        vehicle.setVehicleType(request.getVehicleType().trim());
        vehicle.setCapacity(request.getCapacity());

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            vehicle.setStatus(request.getStatus().trim().toUpperCase());
        }

        Vehicle saved = vehicleRepository.save(vehicle);

        auditLogService.log(currentUserId, "UPDATE_VEHICLE", "VEHICLE", saved.getVehicleId());

        return toResponse(saved);
    }

    public Vehicle getEntityById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy vehicle"));
    }

    private VehicleResponse toResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .vehicleId(vehicle.getVehicleId())
                .plateNo(vehicle.getPlateNo())
                .vehicleType(vehicle.getVehicleType())
                .capacity(vehicle.getCapacity())
                .status(vehicle.getStatus())
                .managerUserId(vehicle.getManagerUser() != null ? vehicle.getManagerUser().getUserId() : null)
                .managerFullName(vehicle.getManagerUser() != null ? vehicle.getManagerUser().getFullName() : null)
                .build();
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "ACTIVE";
        }
        return status.trim().toUpperCase();
    }
}
