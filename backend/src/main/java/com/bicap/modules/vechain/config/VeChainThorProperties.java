package com.bicap.modules.vechain.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "vechain.thor")
public class VeChainThorProperties {
    /** Example: http://localhost:8669 (or http://thor:8669 inside docker network) */
    private String url;

    /** Hex private key, with or without 0x. DEV ONLY. */
    private String devPrivateKey;

    /** If true, season export will commit proof to VeChainThor; if false, it will only persist DB proof. */
    private boolean enabled = false;

    /** If null/blank, defaults to 0x0000000000000000000000000000000000000000 (data clause). */
    private String toAddress;

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getDevPrivateKey() {
        return devPrivateKey;
    }

    public void setDevPrivateKey(String devPrivateKey) {
        this.devPrivateKey = devPrivateKey;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getToAddress() {
        return toAddress;
    }

    public void setToAddress(String toAddress) {
        this.toAddress = toAddress;
    }
}
