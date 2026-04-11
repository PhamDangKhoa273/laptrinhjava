package com.bicap.modules.logistics.service;
import com.bicap.modules.user.entity.User;

import com.bicap.modules.user.entity.User;

import com.bicap.modules.logistics.dto.CreateVehicleRequest;
import com.bicap.modules.logistics.dto.UpdateVehicleRequest;
import com.bicap.modules.logistics.dto.VehicleResponse;
import com.bicap.modules.logistics.entity.Vehicle;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {


    public VehicleResponse createVehicle(CreateVehicleRequest request, Long currentUserId) {
        return null;
    }

    public List<VehicleResponse> getAll() {
        return new ArrayList<>();
    }

    public VehicleResponse getById(Long id) {
        return null;
    }

    public VehicleResponse update(Long id, UpdateVehicleRequest request, Long currentUserId) {
        return null;
    }

    public VehicleResponse deactivate(Long id, Long currentUserId) {
        return null;
    }

    public Vehicle getEntityById(Long id) {
        return null;
    }
}
