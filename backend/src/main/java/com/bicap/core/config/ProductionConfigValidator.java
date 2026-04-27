package com.bicap.core.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Locale;

@Component
public class ProductionConfigValidator {
    private static final int MIN_SECRET_LENGTH = 32;

    private final Environment environment;
    private final String jwtSecret;
    private final String orderDepositGatewaySecret;
    private final String subscriptionGatewaySecret;
    private final boolean blockchainEnabled;
    private final String blockchainRpcUrl;
    private final String blockchainPrivateKey;
    private final String blockchainContractAddress;
    private final boolean vechainEnabled;
    private final String vechainUrl;
    private final String vechainToAddress;

    public ProductionConfigValidator(Environment environment,
                                     @Value("${app.jwt.secret:}") String jwtSecret,
                                     @Value("${app.order.deposit.gateway-secret:}") String orderDepositGatewaySecret,
                                     @Value("${app.subscription.gateway-secret:}") String subscriptionGatewaySecret,
                                     @Value("${blockchain.enabled:false}") boolean blockchainEnabled,
                                     @Value("${blockchain.rpc-url:}") String blockchainRpcUrl,
                                     @Value("${blockchain.private-key:}") String blockchainPrivateKey,
                                     @Value("${blockchain.contract-address:}") String blockchainContractAddress,
                                     @Value("${vechain.thor.enabled:false}") boolean vechainEnabled,
                                     @Value("${vechain.thor.url:}") String vechainUrl,
                                     @Value("${vechain.thor.to-address:}") String vechainToAddress) {
        this.environment = environment;
        this.jwtSecret = jwtSecret;
        this.orderDepositGatewaySecret = orderDepositGatewaySecret;
        this.subscriptionGatewaySecret = subscriptionGatewaySecret;
        this.blockchainEnabled = blockchainEnabled;
        this.blockchainRpcUrl = blockchainRpcUrl;
        this.blockchainPrivateKey = blockchainPrivateKey;
        this.blockchainContractAddress = blockchainContractAddress;
        this.vechainEnabled = vechainEnabled;
        this.vechainUrl = vechainUrl;
        this.vechainToAddress = vechainToAddress;
    }

    @PostConstruct
    public void validate() {
        if (isStrictProfile()) {
            requireStrongSecret("app.jwt.secret", jwtSecret);
            requireStrongSecret("app.order.deposit.gateway-secret", orderDepositGatewaySecret);
            requireStrongSecret("app.subscription.gateway-secret", subscriptionGatewaySecret);
        }
        if (blockchainEnabled) {
            requireNonPlaceholder("blockchain.rpc-url", blockchainRpcUrl, "YOUR_PROJECT_ID");
            requireNonPlaceholder("blockchain.private-key", blockchainPrivateKey, "YOUR_WALLET_PRIVATE_KEY");
            requireNonPlaceholder("blockchain.contract-address", blockchainContractAddress, "YOUR_DEPLOYED_CONTRACT_ADDRESS");
        }
        if (vechainEnabled) {
            requireNonPlaceholder("vechain.thor.url", vechainUrl);
            requireNonPlaceholder("vechain.thor.to-address", vechainToAddress, "0x0000000000000000000000000000000000000000");
        }
    }

    private boolean isStrictProfile() {
        return Arrays.stream(environment.getActiveProfiles())
                .map(profile -> profile.toLowerCase(Locale.ROOT))
                .anyMatch(profile -> profile.equals("prod") || profile.equals("production") || profile.equals("staging"));
    }

    private void requireStrongSecret(String propertyName, String value) {
        requireNonPlaceholder(propertyName, value, "change-me");
        if (value.trim().length() < MIN_SECRET_LENGTH) {
            throw new IllegalStateException(propertyName + " must be at least " + MIN_SECRET_LENGTH + " characters in prod/staging profiles");
        }
    }

    private void requireNonPlaceholder(String propertyName, String value, String... placeholders) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(propertyName + " must be configured");
        }
        String normalized = value.trim();
        for (String placeholder : placeholders) {
            if (placeholder != null && !placeholder.isBlank() && normalized.toLowerCase(Locale.ROOT).contains(placeholder.toLowerCase(Locale.ROOT))) {
                throw new IllegalStateException(propertyName + " must not use placeholder/default value");
            }
        }
    }
}
