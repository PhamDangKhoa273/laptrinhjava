package com.bicap.backend.service;

import com.bicap.backend.dto.CreateBatchRequest;
import com.bicap.backend.dto.ProductBatchResponse;
import com.bicap.backend.dto.UpdateBatchRequest;
import com.bicap.backend.entity.ProductBatch;
import com.bicap.backend.repository.FarmingSeasonRepository;
import com.bicap.backend.repository.ProductBatchRepository;
import com.bicap.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductBatchService {

    private final ProductBatchRepository productBatchRepository;
    private final FarmingSeasonRepository farmingSeasonRepository;
    private final UserRepository userRepository;
    private final BlockchainService blockchainService;
    private final QrCodeService qrCodeService;

    public ProductBatchResponse create(CreateBatchRequest request, Long currentUserId) {
        return null;
    }

    public List<ProductBatchResponse> getAll() {
        return new ArrayList<>();
    }

    public ProductBatchResponse getById(Long id) {
        return null;
    }

    public ProductBatchResponse update(Long id, UpdateBatchRequest request, Long currentUserId) {
        return null;
    }

    public void delete(Long id, Long currentUserId) {
    }

    public ProductBatch getEntityById(Long id) {
        return null;
    }
}
