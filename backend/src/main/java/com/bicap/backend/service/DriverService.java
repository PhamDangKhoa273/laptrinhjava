package com.bicap.backend.service;

import com.bicap.backend.dto.CreateDriverRequest;
import com.bicap.backend.dto.DriverResponse;
import com.bicap.backend.dto.UpdateDriverRequest;
import com.bicap.backend.entity.Driver;
import com.bicap.backend.repository.DriverRepository;
import com.bicap.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public DriverResponse create(CreateDriverRequest request, Long currentUserId) {
        return null;
    }

    public List<DriverResponse> getAll() {
        return new ArrayList<>();
    }

    public DriverResponse getById(Long id) {
        return null;
    }

    public DriverResponse update(Long id, UpdateDriverRequest request, Long currentUserId) {
        return null;
    }

    public DriverResponse deactivate(Long id, Long currentUserId) {
        return null;
    }

    public Driver getEntityById(Long id) {
        return null;
    }
}
