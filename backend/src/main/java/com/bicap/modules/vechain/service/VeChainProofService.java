package com.bicap.modules.vechain.service;

import com.bicap.modules.vechain.config.VeChainThorProperties;
import com.bicap.core.enums.BlockchainGovernanceStatus;
import com.bicap.modules.batch.entity.BlockchainTransaction;
import com.bicap.modules.batch.repository.BlockchainTransactionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.vechain.devkit.Transaction;
import org.vechain.devkit.cry.Keccak;
import org.vechain.devkit.cry.Secp256k1;
import org.vechain.devkit.cry.Utils;
import org.web3j.crypto.Credentials;
import org.vechain.devkit.types.Clause;
import org.vechain.devkit.types.Reserved;

import java.math.BigInteger;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
@Slf4j
public class VeChainProofService {
    private final VeChainThorProperties props;
    private final ObjectMapper objectMapper;
    private final BlockchainTransactionRepository transactionRepository;

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

    public String getBestBlockId() {
        String json = get("/blocks/best");
        try {
            JsonNode node = objectMapper.readTree(json);
            return node.get("id").asText();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse /blocks/best", e);
        }
    }

    /**
     * Commits a proof by submitting a raw transaction hex to Thor.
     *
     * IMPORTANT: This requires a properly signed raw transaction. If signing is not implemented,
     * this method will fail and Season export should remain non-fatal.
     */
    public String commitRawSignedTransaction(String rawHex) {
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

    @Transactional
    public BlockchainTransaction commitAndTrack(String relatedEntityType,
                                                Long relatedEntityId,
                                                String actionType,
                                                String dataPayload,
                                                String canonicalHashHexNo0x,
                                                String traceCode) {
        BlockchainTransaction tx = new BlockchainTransaction();
        tx.setRelatedEntityType(relatedEntityType);
        tx.setRelatedEntityId(relatedEntityId);
        tx.setActionType(actionType);
        tx.setDataPayload(dataPayload);

        if (!props.isEnabled()) {
            tx.setTxHash("DISABLED-" + canonicalHashHexNo0x);
            tx.setTxStatus("DISABLED");
            tx.setGovernanceStatus(BlockchainGovernanceStatus.GOVERNED);
            tx.setGovernanceNote("VeChainThor disabled, payload kept in DB only");
            return transactionRepository.save(tx);
        }

        try {
            String txId = commitSeasonExportProof(canonicalHashHexNo0x, traceCode);
            tx.setTxHash(txId);

            JsonNode receipt = waitForReceipt(txId, 10, 1500L);
            boolean reverted = receipt.path("reverted").asBoolean(false);
            long gasUsed = receipt.path("gasUsed").asLong(0L);
            long blockNumber = receipt.path("meta").path("blockNumber").asLong(-1L);

            tx.setTxStatus(reverted ? "REVERTED" : "CONFIRMED");
            tx.setGovernanceStatus(reverted ? BlockchainGovernanceStatus.FAILED : BlockchainGovernanceStatus.SUCCESS);
            tx.setGovernanceNote("txId=" + txId + ", block=" + blockNumber + ", gasUsed=" + gasUsed + ", reverted=" + reverted);
            return transactionRepository.save(tx);
        } catch (Exception e) {
            tx.setTxHash("FAILED-" + canonicalHashHexNo0x);
            tx.setTxStatus("FAILED");
            tx.setGovernanceStatus(BlockchainGovernanceStatus.FAILED);
            String note = e.getClass().getName() + ": " + e.getMessage();
            if (e.getCause() != null) {
                note += " | cause=" + e.getCause().getClass().getName() + ": " + e.getCause().getMessage();
            }
            tx.setGovernanceNote(note);
            log.warn("VeChain commit failed for entityType={} entityId={} actionType={} traceCode={}: {}", relatedEntityType, relatedEntityId, actionType, traceCode, note, e);
            return transactionRepository.save(tx);
        }
    }

    public String commitSeasonExportProof(String canonicalHashHexNo0x, String traceCode) {
        if (!props.isEnabled()) return null;
        if (props.getDevPrivateKey() == null || props.getDevPrivateKey().isBlank()) {
            throw new IllegalStateException("Missing vechain.thor.devPrivateKey");
        }

        String payload = "BICAP|SEASON_EXPORT|" + traceCode + "|" + canonicalHashHexNo0x;
        String dataHex = "0x" + Utils.bytesToHex(payload.getBytes(StandardCharsets.UTF_8));

        String to = props.getToAddress();
        if (to == null || to.isBlank()) to = "0x0000000000000000000000000000000000000000";

        int chainTag = getChainTag();
        String best = getBestBlockId();
        String blockRef = Utils.bytesToHex(Arrays.copyOfRange(Utils.hexToBytes(strip0x(best)), 0, 8));

        Clause[] clauses = new Clause[]{ new Clause(to, "0x0", dataHex) };

        // Minimal safe defaults for this demo tx
        String expiration = "720";
        String gasPriceCoef = "0";
        String gas = "5000000";

        // Devkit NumericKind expects decimal unless prefixed with 0x
        byte[] nonceHash = Keccak.keccak256(Utils.AsciiToBytes(traceCode + "|" + canonicalHashHexNo0x));
        String nonce = new BigInteger(1, Arrays.copyOfRange(nonceHash, 0, 8)).toString();
        String txSeed = traceCode + "|" + canonicalHashHexNo0x;
        log.debug("VeChain txSeed={}, blockRef={}, chainTag={}, nonce={}, gas={}, to={}", txSeed, blockRef, chainTag, nonce, gas, to);

        Transaction tx = new Transaction(
                String.valueOf(chainTag),
                blockRef,
                expiration,
                clauses,
                gasPriceCoef,
                gas,
                null,
                nonce,
                Reserved.getNullReserved()
        );

        log.debug("VeChain intrinsicGas={}", tx.getIntrinsicGas());
        Credentials credentials = Credentials.create(props.getDevPrivateKey().trim());
        String origin = credentials.getAddress().startsWith("0x") ? credentials.getAddress() : ("0x" + credentials.getAddress());
        byte[] priv = Utils.hexToBytes(strip0x(props.getDevPrivateKey()));
        byte[] signingHash = tx.getSigningHash(null);
        byte[] sig = Secp256k1.sign(signingHash, priv);
        log.debug("VeChain origin={}, signingHashLen={}, sigLen={}, v={}", origin, signingHash.length, sig.length, sig[64] & 0xff);
        tx.setSignature(sig);

        String raw = "0x" + Utils.bytesToHex(tx.encode());
        log.debug("VeChain rawTxLen={}, txId={}", raw.length(), tx.getIdAsString());
        try {
            return commitRawSignedTransaction(raw);
        } catch (Exception e) {
            throw new IllegalStateException("Thor submit failed for origin=" + origin + ", txId=" + tx.getIdAsString() + ", seed=" + txSeed, e);
        }
    }

    public JsonNode waitForReceipt(String txId, int maxAttempts, long sleepMs) {
        for (int attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                JsonNode receipt = getTransactionReceipt(txId);
                if (receipt != null && !receipt.isMissingNode() && !receipt.isNull()) {
                    return receipt;
                }
            } catch (Exception ex) {
                log.debug("VeChain receipt not available yet for txId={} attempt={}/{}", txId, attempt + 1, maxAttempts, ex);
            }

            try {
                Thread.sleep(sleepMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("Interrupted while waiting for VeChain receipt", e);
            }
        }
        throw new IllegalStateException("Timed out waiting for VeChain receipt for txId=" + txId);
    }

    private static String strip0x(String hex) {
        if (hex == null) return null;
        return (hex.startsWith("0x") || hex.startsWith("0X")) ? hex.substring(2) : hex;
    }
}
