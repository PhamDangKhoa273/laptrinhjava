package com.bicap.backend.service;

import com.bicap.backend.dto.CreateServicePackageRequest;
import com.bicap.backend.dto.ServicePackageResponse;
import com.bicap.backend.dto.UpdateServicePackageRequest;
import com.bicap.backend.entity.ServicePackage;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.ServicePackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServicePackageService {

    private final ServicePackageRepository repository;

    @Transactional
    public ServicePackageResponse create(CreateServicePackageRequest request) {
        String packageCode = request.getPackageCode().trim();
        if (repository.existsByPackageCodeIgnoreCase(packageCode)) {
            throw new BusinessException("packageCode đã tồn tại");
        }

        ServicePackage entity = new ServicePackage();
        entity.setPackageCode(packageCode);
        entity.setPackageName(request.getPackageName().trim());
        entity.setPrice(request.getPrice());
        entity.setDurationDays(request.getDurationDays());
        entity.setMaxSeasons(request.getMaxSeasons());
        entity.setMaxListings(request.getMaxListings());
        entity.setDescription(request.getDescription());
        entity.setStatus(normalizeStatus(request.getStatus()));

        return toResponse(repository.save(entity));
    }

    public List<ServicePackageResponse> getAll() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public ServicePackageResponse getById(Long id) {
        return toResponse(getEntityById(id));
    }

    @Transactional
    public ServicePackageResponse update(Long id, UpdateServicePackageRequest request) {
        ServicePackage entity = getEntityById(id);

        if (request.getPackageName() != null) {
            entity.setPackageName(request.getPackageName().trim());
        }
        if (request.getPrice() != null) {
            entity.setPrice(request.getPrice());
        }
        if (request.getDurationDays() != null) {
            entity.setDurationDays(request.getDurationDays());
        }
        if (request.getMaxSeasons() != null) {
            entity.setMaxSeasons(request.getMaxSeasons());
        }
        if (request.getMaxListings() != null) {
            entity.setMaxListings(request.getMaxListings());
        }
        if (request.getDescription() != null) {
            entity.setDescription(request.getDescription().trim());
        }
        if (request.getStatus() != null) {
            entity.setStatus(normalizeStatus(request.getStatus()));
        }

        return toResponse(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getEntityById(id));
    }

    private ServicePackage getEntityById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy gói dịch vụ"));
    }

    private ServicePackageResponse toResponse(ServicePackage entity) {
        return ServicePackageResponse.builder()
                .packageId(entity.getPackageId())
                .packageCode(entity.getPackageCode())
                .packageName(entity.getPackageName())
                .price(entity.getPrice())
                .durationDays(entity.getDurationDays())
                .maxSeasons(entity.getMaxSeasons())
                .maxListings(entity.getMaxListings())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .build();
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "ACTIVE";
        }
        return status.trim().toUpperCase();
    }
}
