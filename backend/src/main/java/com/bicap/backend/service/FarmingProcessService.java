package com.bicap.backend.service;

import com.bicap.backend.dto.CreateProcessRequest;
import com.bicap.backend.dto.FarmingProcessResponse;
import com.bicap.backend.dto.UpdateProcessRequest;
import com.bicap.backend.entity.FarmingProcess;
import com.bicap.backend.repository.FarmingProcessRepository;
import com.bicap.backend.repository.FarmingSeasonRepository;
import com.bicap.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FarmingProcessService {

    private final FarmingProcessRepository farmingProcessRepository;
    private final FarmingSeasonRepository farmingSeasonRepository;
    private final UserRepository userRepository;
    private final BlockchainService blockchainService;

    public FarmingProcessResponse create(CreateProcessRequest request, Long currentUserId) {
        return null;
    }

    public List<FarmingProcessResponse> getAll() {
        return new ArrayList<>();
    }

    public FarmingProcessResponse getById(Long id) {
        return null;
    }

    public FarmingProcessResponse update(Long id, UpdateProcessRequest request, Long currentUserId) {
        return null;
    }

    public void delete(Long id, Long currentUserId) {
    }

    public FarmingProcess getEntityById(Long id) {
        return null;
    }
}
