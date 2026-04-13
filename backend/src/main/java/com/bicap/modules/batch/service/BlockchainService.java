package com.bicap.modules.batch.service;

import com.bicap.modules.batch.config.BlockchainProperties;
import com.bicap.modules.batch.dto.BatchBlockchainPayload;
import com.bicap.modules.batch.dto.BlockchainResult;
import com.bicap.modules.batch.dto.ProcessBlockchainPayload;
import com.bicap.modules.batch.dto.SeasonBlockchainPayload;
import com.bicap.modules.batch.entity.BlockchainTransaction;
import com.bicap.modules.batch.repository.BlockchainTransactionRepository;
import com.bicap.modules.batch.util.HashUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthCall;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.gas.DefaultGasProvider;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class BlockchainService {

    private final BlockchainTransactionRepository transactionRepository;
    private final BlockchainProperties properties;

    public BlockchainService(BlockchainTransactionRepository transactionRepository,
                             BlockchainProperties properties) {
        this.transactionRepository = transactionRepository;
        this.properties = properties;
    }

    private Web3j web3j() {
        return Web3j.build(new HttpService(properties.getRpcUrl()));
    }

    private Credentials credentials() {
        return Credentials.create(properties.getPrivateKey());
    }

    @Transactional
    public BlockchainResult saveSeason(SeasonBlockchainPayload payload) {
        return saveTransaction("SEASON", payload.getSeasonId(), "CREATE", HashUtils.toCanonicalJson(payload.toMap()));
    }

    @Transactional
    public BlockchainResult saveProcess(ProcessBlockchainPayload payload, String actionType) {
        return saveTransaction("PROCESS", payload.getProcessId(), actionType, HashUtils.toCanonicalJson(payload.toMap()));
    }

    @Transactional
    public BlockchainResult saveBatch(BatchBlockchainPayload payload) {
        return saveTransaction("BATCH", payload.getBatchId(), "UPSERT", HashUtils.toCanonicalJson(payload.toMap()));
    }

    @Transactional
    public BlockchainResult saveTransaction(String relatedEntityType,
                                            Long relatedEntityId,
                                            String actionType,
                                            String dataPayload) {
        String dataHash = HashUtils.sha256(dataPayload);
        BlockchainTransaction tx = new BlockchainTransaction();
        tx.setRelatedEntityType(relatedEntityType);
        tx.setRelatedEntityId(relatedEntityId);
        tx.setActionType(actionType);

        if (!properties.isEnabled()) {
            tx.setTxHash("DISABLED-" + dataHash);
            tx.setTxStatus("DISABLED");
            BlockchainTransaction saved = transactionRepository.save(tx);
            return toResult(saved, "Blockchain đang tắt, đã lưu hash nội bộ.");
        }

        try {
            Web3j web3j = web3j();
            Credentials credentials = credentials();
            RawTransactionManager txManager = new RawTransactionManager(web3j, credentials, properties.getChainId());

            Function function = new Function(
                    "addProduct",
                    Arrays.asList(
                            new Uint256(BigInteger.valueOf(relatedEntityId)),
                            new Utf8String(relatedEntityType),
                            new Utf8String(actionType),
                            new Utf8String(dataHash)
                    ),
                    List.of()
            );

            String encodedFunction = FunctionEncoder.encode(function);
            org.web3j.protocol.core.methods.response.EthSendTransaction response = txManager.sendTransaction(
                    DefaultGasProvider.GAS_PRICE,
                    DefaultGasProvider.GAS_LIMIT,
                    properties.getContractAddress(),
                    encodedFunction,
                    BigInteger.ZERO
            );

            if (response.hasError()) {
                throw new RuntimeException(response.getError().getMessage());
            }

            tx.setTxHash(response.getTransactionHash());
            tx.setTxStatus("SUCCESS");
            BlockchainTransaction saved = transactionRepository.save(tx);
            return toResult(saved, "Ghi dữ liệu blockchain thành công.");
        } catch (Exception exception) {
            tx.setTxHash(null);
            tx.setTxStatus("FAILED: " + exception.getMessage());
            BlockchainTransaction saved = transactionRepository.save(tx);
            return toResult(saved, "Không thể ghi blockchain, dữ liệu DB vẫn được giữ lại.");
        }
    }

    private BlockchainResult toResult(BlockchainTransaction transaction, String message) {
        return BlockchainResult.builder()
                .txHash(transaction.getTxHash())
                .status(transaction.getTxStatus())
                .message(message)
                .timestamp(transaction.getCreatedAt() != null ? transaction.getCreatedAt() : LocalDateTime.now())
                .build();
    }

    public String getOnChainHash(String entityType, Long entityId, String actionType) {
        try {
            Web3j web3j = web3j();
            Function function = new Function(
                    "getProduct",
                    List.of(new Uint256(BigInteger.valueOf(entityId))),
                    Arrays.asList(
                            new TypeReference<Utf8String>() {},
                            new TypeReference<Utf8String>() {},
                            new TypeReference<Utf8String>() {}
                    )
            );

            String encoded = FunctionEncoder.encode(function);
            EthCall response = web3j.ethCall(
                    Transaction.createEthCallTransaction(
                            credentials().getAddress(),
                            properties.getContractAddress(),
                            encoded
                    ),
                    DefaultBlockParameterName.LATEST
            ).send();

            @SuppressWarnings("rawtypes")
            List<Type> decoded = FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters());
            if (decoded.size() < 3) {
                return null;
            }
            return decoded.get(2).getValue().toString();
        } catch (Exception e) {
            throw new RuntimeException("Không thể đọc hash từ blockchain", e);
        }
    }
}
