package com.bicap.modules.iot.entity;

import com.bicap.modules.farm.entity.Farm;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "threshold_rules")
public class ThresholdRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rule_id")
    private Long ruleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id")
    private Farm farm;

    @Column(name = "metric", nullable = false)
    private String metric;

    @Column(name = "min_value", precision = 18, scale = 4)
    private BigDecimal minValue;

    @Column(name = "max_value", precision = 18, scale = 4)
    private BigDecimal maxValue;

    @Column(name = "enabled")
    private boolean enabled = true;

    public Long getRuleId() { return ruleId; }
    public void setRuleId(Long ruleId) { this.ruleId = ruleId; }
    public Farm getFarm() { return farm; }
    public void setFarm(Farm farm) { this.farm = farm; }
    public String getMetric() { return metric; }
    public void setMetric(String metric) { this.metric = metric; }
    public BigDecimal getMinValue() { return minValue; }
    public void setMinValue(BigDecimal minValue) { this.minValue = minValue; }
    public BigDecimal getMaxValue() { return maxValue; }
    public void setMaxValue(BigDecimal maxValue) { this.maxValue = maxValue; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
}
