package com.bicap.core.config;

import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ProductionConfigValidatorTests {

    @Test
    void validate_shouldRejectChangeMeOrderSecretInProd() {
        ProductionConfigValidator validator = validator(
                new String[]{"prod"},
                strongSecret(),
                "change-me",
                strongSecret(),
                false,
                "",
                "",
                "",
                false,
                "",
                "");

        assertThatThrownBy(validator::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("app.order.deposit.gateway-secret");
    }

    @Test
    void validate_shouldRejectBlankJwtSecretInProd() {
        ProductionConfigValidator validator = validator(
                new String[]{"prod"},
                "",
                strongSecret(),
                strongSecret(),
                false,
                "",
                "",
                "",
                false,
                "",
                "");

        assertThatThrownBy(validator::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("app.jwt.secret");
    }

    @Test
    void validate_shouldRejectEnabledBlockchainWithPlaceholderPrivateKey() {
        ProductionConfigValidator validator = validator(
                new String[]{"local"},
                "",
                "",
                "",
                true,
                "https://example.test/rpc",
                "YOUR_WALLET_PRIVATE_KEY",
                "0x1111111111111111111111111111111111111111",
                false,
                "",
                "");

        assertThatThrownBy(validator::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("blockchain.private-key");
    }

    @Test
    void validate_shouldAllowRelaxedLocalConfigWhenOptionalChainsDisabled() {
        ProductionConfigValidator validator = validator(
                new String[]{"local"},
                "",
                "",
                "",
                false,
                "",
                "",
                "",
                false,
                "",
                "");

        assertThatCode(validator::validate).doesNotThrowAnyException();
    }

    @Test
    void validate_shouldPassProdWithStrongSecretsAndBlockchainDisabled() {
        ProductionConfigValidator validator = validator(
                new String[]{"prod"},
                strongSecret(),
                strongSecret(),
                strongSecret(),
                false,
                "",
                "",
                "",
                false,
                "",
                "");

        assertThatCode(validator::validate).doesNotThrowAnyException();
    }

    private ProductionConfigValidator validator(String[] profiles,
                                                String jwtSecret,
                                                String orderSecret,
                                                String subscriptionSecret,
                                                boolean blockchainEnabled,
                                                String blockchainRpcUrl,
                                                String blockchainPrivateKey,
                                                String blockchainContractAddress,
                                                boolean vechainEnabled,
                                                String vechainUrl,
                                                String vechainToAddress) {
        Environment environment = mock(Environment.class);
        when(environment.getActiveProfiles()).thenReturn(profiles);
        return new ProductionConfigValidator(
                environment,
                jwtSecret,
                orderSecret,
                subscriptionSecret,
                blockchainEnabled,
                blockchainRpcUrl,
                blockchainPrivateKey,
                blockchainContractAddress,
                vechainEnabled,
                vechainUrl,
                vechainToAddress);
    }

    private String strongSecret() {
        return "0123456789abcdef0123456789abcdef";
    }
}
