package com.bicap.modules.vechain.service;

import com.bicap.modules.vechain.config.VeChainThorProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import java.math.BigInteger;

@Component
@RequiredArgsConstructor
public class VeChainThorClient {
    private final VeChainThorProperties props;
    private final ObjectMapper objectMapper;

    private final HttpClient http = HttpClient.newHttpClient();

    private String baseUrl() {
        if (props.getUrl() == null || props.getUrl().isBlank()) {
            throw new IllegalStateException("Missing vechain.thor.url");
        }
        return props.getUrl().trim().replaceAll("/+$", "");
    }

    private String get(String path) {
        try {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl() + path))
                    .GET()
                    .build();
            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() >= 400) {
                throw new IllegalStateException("Thor GET " + path + " failed: HTTP " + resp.statusCode() + " body=" + resp.body());
            }
            return resp.body();
        } catch (Exception e) {
            throw new IllegalStateException("Thor GET " + path + " failed", e);
        }
    }

    private String postJson(String path, String jsonBody) {
        try {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl() + path))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();
            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() >= 400) {
                throw new IllegalStateException("Thor POST " + path + " failed: HTTP " + resp.statusCode() + " body=" + resp.body());
            }
            return resp.body();
        } catch (Exception e) {
            throw new IllegalStateException("Thor POST " + path + " failed", e);
        }
    }

    public String getBestBlockId() {
        String json = get("/blocks/best");
        try {
            JsonNode node = objectMapper.readTree(json);
            return node.get("id").asText();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse /blocks/best", e);
        }
    }

    /** chainTag = last byte of genesis block id */
    public int getChainTag() {
        String json = get("/blocks/0");
        try {
            JsonNode node = objectMapper.readTree(json);
            String id = node.get("id").asText();
            String last2 = id.substring(id.length() - 2);
            return new BigInteger(last2, 16).intValue();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse /blocks/0", e);
        }
    }

    public String commitRawTransaction(String rawHex) {
        String body = "{\"raw\":\"" + rawHex + "\"}";
        String json = postJson("/transactions", body);
        try {
            JsonNode node = objectMapper.readTree(json);
            return node.get("id").asText();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse /transactions response", e);
        }
    }

    public JsonNode getTransactionReceipt(String txId) {
        String json = get("/transactions/" + txId + "/receipt");
        try {
            return objectMapper.readTree(json);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse tx receipt", e);
        }
    }
}

