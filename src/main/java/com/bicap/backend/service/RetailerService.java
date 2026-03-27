package com.bicap.backend.service;

import com.bicap.backend.entity.Retailer;
import com.bicap.backend.entity.User;
import com.bicap.backend.enums.RoleName;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.RetailerRepository;
import com.bicap.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RetailerService {

    private final RetailerRepository retailerRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public Retailer create(Retailer retailer, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user"));

        if (!userService.hasRole(user, RoleName.RETAILER)) {
            throw new BusinessException("User phải có role RETAILER");
        }

        if (retailerRepository.existsByUserUserId(userId)) {
            throw new BusinessException("User này đã có hồ sơ retailer");
        }

        if (retailerRepository.existsByRetailerCode(retailer.getRetailerCode())) {
            throw new BusinessException("retailerCode đã tồn tại");
        }

        if (retailerRepository.existsByBusinessLicenseNo(retailer.getBusinessLicenseNo())) {
            throw new BusinessException("businessLicenseNo đã tồn tại");
        }

        retailer.setUser(user);
        return retailerRepository.save(retailer);
    }

    public List<Retailer> getAll() {
        return retailerRepository.findAll();
    }

    public Retailer getById(Long id) {
        return retailerRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy retailer"));
    }

    public Retailer update(Long id, Retailer request) {
        Retailer retailer = getById(id);

        retailer.setRetailerName(request.getRetailerName());
        retailer.setBusinessLicenseNo(request.getBusinessLicenseNo());
        retailer.setAddress(request.getAddress());
        retailer.setStatus(request.getStatus());

        return retailerRepository.save(retailer);
    }
}