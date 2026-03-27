package com.bicap.backend.service;

import com.bicap.backend.entity.ServicePackage;
import com.bicap.backend.repository.ServicePackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServicePackageService {

    private final ServicePackageRepository repository;

    public ServicePackage create(ServicePackage p) {
        return repository.save(p);
    }

    public List<ServicePackage> getAll() {
        return repository.findAll();
    }
}