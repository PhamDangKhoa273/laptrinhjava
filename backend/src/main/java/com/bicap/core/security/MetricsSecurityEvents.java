package com.bicap.core.security;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

@Component
public class MetricsSecurityEvents {
    public final Counter authSuccess;
    public final Counter authFail;
    public final Counter rateLimitTriggered;
    public final Counter blockchainTxSuccess;
    public final Counter blockchainTxFail;
    public final Counter orderThroughput;
    public final Counter shipmentThroughput;
    public final Counter iotAlertCount;

    public MetricsSecurityEvents(MeterRegistry registry) {
        this.authSuccess = Counter.builder("bicap_auth_success_total").register(registry);
        this.authFail = Counter.builder("bicap_auth_fail_total").register(registry);
        this.rateLimitTriggered = Counter.builder("bicap_rate_limit_triggered_total").register(registry);
        this.blockchainTxSuccess = Counter.builder("bicap_blockchain_tx_success_total").register(registry);
        this.blockchainTxFail = Counter.builder("bicap_blockchain_tx_fail_total").register(registry);
        this.orderThroughput = Counter.builder("bicap_order_throughput_total").register(registry);
        this.shipmentThroughput = Counter.builder("bicap_shipment_throughput_total").register(registry);
        this.iotAlertCount = Counter.builder("bicap_iot_alert_count_total").register(registry);
    }
}
