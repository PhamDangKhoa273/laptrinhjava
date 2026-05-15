package com.bicap.modules.iot.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.iot.dto.ThresholdRuleRequest;
import com.bicap.modules.iot.dto.ThresholdRuleResponse;
import com.bicap.modules.iot.entity.ThresholdRule;
import com.bicap.modules.iot.repository.ThresholdRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ThresholdRuleService {

    private final ThresholdRuleRepository thresholdRuleRepository;
    private final FarmRepository farmRepository;

    public List<ThresholdRuleResponse> getMyThresholds() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return thresholdRuleRepository.findByFarmOwnerUserUserId(currentUserId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ThresholdRuleResponse create(ThresholdRuleRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Farm farm = farmRepository.findByOwnerUserUserId(currentUserId)
                .orElseThrow(() -> new BusinessException("Bạn chưa có hồ sơ nông trại"));

        ThresholdRule rule = new ThresholdRule();
        rule.setFarm(farm);
        rule.setMetric(request.getMetric().trim().toUpperCase());
        rule.setMinValue(request.getMinValue());
        rule.setMaxValue(request.getMaxValue());
        rule.setEnabled(request.isEnabled());

        return toResponse(thresholdRuleRepository.save(rule));
    }

    @Transactional
    public ThresholdRuleResponse update(Long ruleId, ThresholdRuleRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        ThresholdRule rule = thresholdRuleRepository.findById(ruleId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy ngưỡng cảnh báo"));

        if (rule.getFarm() == null || rule.getFarm().getOwnerUser() == null
                || !rule.getFarm().getOwnerUser().getUserId().equals(currentUserId)) {
            throw new BusinessException("Bạn không có quyền cập nhật ngưỡng này");
        }

        rule.setMetric(request.getMetric().trim().toUpperCase());
        rule.setMinValue(request.getMinValue());
        rule.setMaxValue(request.getMaxValue());
        rule.setEnabled(request.isEnabled());

        return toResponse(thresholdRuleRepository.save(rule));
    }

    @Transactional
    public void delete(Long ruleId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        ThresholdRule rule = thresholdRuleRepository.findById(ruleId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy ngưỡng cảnh báo"));

        if (rule.getFarm() == null || rule.getFarm().getOwnerUser() == null
                || !rule.getFarm().getOwnerUser().getUserId().equals(currentUserId)) {
            throw new BusinessException("Bạn không có quyền xóa ngưỡng này");
        }

        thresholdRuleRepository.delete(rule);
    }

    private ThresholdRuleResponse toResponse(ThresholdRule rule) {
        ThresholdRuleResponse response = new ThresholdRuleResponse();
        response.setRuleId(rule.getRuleId());
        response.setMetric(rule.getMetric());
        response.setMinValue(rule.getMinValue());
        response.setMaxValue(rule.getMaxValue());
        response.setEnabled(rule.isEnabled());
        if (rule.getFarm() != null) {
            response.setFarmId(rule.getFarm().getFarmId());
            response.setFarmName(rule.getFarm().getFarmName());
        }
        return response;
    }
}
