package com.bicap.modules.logistics.service;

import com.bicap.core.AuditLogService;
import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BadRequestException;
import com.bicap.core.exception.BusinessException;
import com.bicap.core.exception.ResourceNotFoundException;
import com.bicap.modules.logistics.dto.CreateVehicleRequest;
import com.bicap.modules.logistics.dto.UpdateVehicleRequest;
import com.bicap.modules.logistics.dto.VehicleResponse;
import com.bicap.modules.logistics.entity.Vehicle;
import com.bicap.modules.logistics.repository.VehicleRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.service.UserService;
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
        if (vehicleRepository.existsByPlateNo(request.getPlateNo().trim())) {
            throw new BadRequestException("plateNo đã tồn tại");
        }

        User managerUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager không tồn tại"));

        Vehicle vehicle = new Vehicle();
        vehicle.setPlateNo(request.getPlateNo().trim());
        vehicle.setVehicleType(request.getVehicleType().trim());
        vehicle.setCapacity(request.getCapacity().intValue());
        vehicle.setStatus(resolveStatus(request.getStatus()));
        vehicle.setManagerUser(managerUser);

        Vehicle saved = vehicleRepository.save(vehicle);
        auditLogService.log(currentUserId, "CREATE_VEHICLE", "VEHICLE", saved.getVehicleId());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> getAll() {
        return vehicleRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public VehicleResponse getById(Long id) {
        return toResponse(getEntityById(id));
    }

    @Transactional
    public VehicleResponse update(Long id, UpdateVehicleRequest request, Long currentUserId) {
        Vehicle vehicle = getEntityById(id);

        if (!vehicle.getManagerUser().getUserId().equals(currentUserId)) {
            User actingUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
            boolean isAdmin = userService.hasRole(actingUser, RoleName.ADMIN);
            if (!isAdmin) {
                throw new BusinessException("Bạn không có quyền cập nhật vehicle này");
            }
        }

        vehicle.setVehicleType(request.getVehicleType().trim());
        vehicle.setCapacity(request.getCapacity().intValue());
        vehicle.setStatus(resolveStatus(request.getStatus()));

        Vehicle saved = vehicleRepository.save(vehicle);
        auditLogService.log(currentUserId, "UPDATE_VEHICLE", "VEHICLE", saved.getVehicleId());
        return toResponse(saved);
    }

    @Transactional
    public VehicleResponse deactivate(Long id, Long currentUserId) {
        Vehicle vehicle = getEntityById(id);

        if (!vehicle.getManagerUser().getUserId().equals(currentUserId)) {
            User actingUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
            boolean isAdmin = userService.hasRole(actingUser, RoleName.ADMIN);
            if (!isAdmin) {
                throw new BusinessException("Bạn không có quyền ngừng kích hoạt vehicle này");
            }
        }

        vehicle.setStatus("INACTIVE");
        Vehicle saved = vehicleRepository.save(vehicle);
        auditLogService.log(currentUserId, "DEACTIVATE_VEHICLE", "VEHICLE", saved.getVehicleId());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Vehicle getEntityById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle không tồn tại"));
    }

    private VehicleResponse toResponse(Vehicle vehicle) {
        VehicleResponse response = new VehicleResponse();
        response.setVehicleId(vehicle.getVehicleId());
        response.setPlateNo(vehicle.getPlateNo());
        response.setVehicleType(vehicle.getVehicleType());
        response.setCapacity(vehicle.getCapacity());
        response.setStatus(vehicle.getStatus());
        response.setManagerUserId(vehicle.getManagerUser() != null ? vehicle.getManagerUser().getUserId() : null);
        response.setManagerFullName(vehicle.getManagerUser() != null ? vehicle.getManagerUser().getFullName() : null);
        return response;
    }

    private String resolveStatus(String status) {
        if (status == null || status.isBlank()) {
            return "ACTIVE";
        }
        return status.trim().toUpperCase();
    }
}
