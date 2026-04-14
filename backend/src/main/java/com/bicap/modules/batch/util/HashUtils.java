package com.bicap.modules.batch.util;

import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

public class HashUtils {
    private static final ObjectMapper MAPPER = com.fasterxml.jackson.databind.json.JsonMapper.builder()
            .addModule(new JavaTimeModule())
            .addModule(new com.fasterxml.jackson.databind.module.SimpleModule()
                    .addSerializer(java.math.BigDecimal.class, new com.fasterxml.jackson.databind.JsonSerializer<>() {
                        @Override
                        public void serialize(java.math.BigDecimal value, com.fasterxml.jackson.core.JsonGenerator gen, com.fasterxml.jackson.databind.SerializerProvider serializers) throws java.io.IOException {
                            gen.writeNumber(value.stripTrailingZeros());
                        }
                    }))
            .configure(MapperFeature.SORT_PROPERTIES_ALPHABETICALLY, true)
            .configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true)
            .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
            .build();

    public static String toCanonicalJson(Map<String, Object> payload) {
        try {
            return MAPPER.writeValueAsString(payload);
        } catch (Exception e) {
            throw new RuntimeException("Không thể serialize payload", e);
        }
    }

    public static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : encodedHash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Không thể hash SHA-256", e);
        }
    }
}
