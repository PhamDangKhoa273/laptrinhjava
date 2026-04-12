package com.bicap.modules.batch.service;

import com.bicap.modules.batch.config.BlockchainProperties;
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
import java.util.Arrays;
import java.util.List;

@Service
public class BlockchainService {

    private final BlockchainTransactionRepository transactionRepository;
    private final BlockchainProperties properties;

    public BlockchainService(
            BlockchainTransactionRepository transactionRepository,
            BlockchainProperties properties
    ) {
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
    public String saveProcess(Long processId, String actionType, String dataPayload) {
        return saveTransaction("PROCESS", processId, actionType, dataPayload).getTxHash();
    }

    @Transactional
    public String saveSeason(Long seasonId, String dataPayload) {
        return saveTransaction("SEASON", seasonId, "CREATE", dataPayload).getTxHash();
    }

    @Transactional
    public String saveBatch(Long batchId, String dataPayload) {
        return saveTransaction("BATCH", batchId, "UPSERT", dataPayload).getTxHash();
    }

    @Transactional
    public BlockchainTransaction saveTransaction(
            String relatedEntityType,
            Long relatedEntityId,
            String actionType,
            String dataPayload
    ) {
        String dataHash = HashUtils.sha256(dataPayload);

        if (!properties.isEnabled()) {
            BlockchainTransaction tx = new BlockchainTransaction();
            tx.setRelatedEntityType(relatedEntityType);
            tx.setRelatedEntityId(relatedEntityId);
            tx.setActionType(actionType);
            tx.setTxHash("DISABLED-" + dataHash);
            tx.setTxStatus("DISABLED");
            return transactionRepository.save(tx);
        }

        try {
            Web3j web3j = web3j();
            Credentials credentials = credentials();
            RawTransactionManager txManager =
                    new RawTransactionManager(web3j, credentials, properties.getChainId());

            // Call addProduct(uint _id, string _name, string _origin, string _timestamp)
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

            org.web3j.protocol.core.methods.response.EthSendTransaction response =
                    txManager.sendTransaction(
                            DefaultGasProvider.GAS_PRICE,
                            DefaultGasProvider.GAS_LIMIT,
                            properties.getContractAddress(),
                            encodedFunction,
                            BigInteger.ZERO
                    );

            if (response.hasError()) {
                throw new RuntimeException(response.getError().getMessage());
            }

            BlockchainTransaction tx = new BlockchainTransaction();
            tx.setRelatedEntityType(relatedEntityType);
            tx.setRelatedEntityId(relatedEntityId);
            tx.setActionType(actionType);
            tx.setTxHash(response.getTransactionHash());
            tx.setTxStatus("SUCCESS");

            return transactionRepository.save(tx);
        } catch (Exception e) {
            BlockchainTransaction tx = new BlockchainTransaction();
            tx.setRelatedEntityType(relatedEntityType);
            tx.setRelatedEntityId(relatedEntityId);
            tx.setActionType(actionType);
            tx.setTxHash(null);
            tx.setTxStatus("FAILED: " + e.getMessage());
            return transactionRepository.save(tx);
        }
    }

    public String getOnChainHash(String entityType, Long entityId, String actionType) {
        try {
            Web3j web3j = web3j();

            // Call getProduct(uint _id) returns (string, string, string)
            Function function = new Function(
                    "getProduct",
                    List.of(new Uint256(BigInteger.valueOf(entityId))),
                    Arrays.asList(
                            new TypeReference<Utf8String>() {},  // name (relatedEntityType)
                            new TypeReference<Utf8String>() {},  // origin (actionType)
                            new TypeReference<Utf8String>() {}   // timestamp (dataHash)
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

            List<Type> decoded = FunctionReturnDecoder.decode(
                    response.getValue(),
                    function.getOutputParameters()
            );

            if (decoded.size() < 3) {
                return null;
            }

            return decoded.get(2).getValue().toString();
        } catch (Exception e) {
            throw new RuntimeException("Không thể đọc hash từ blockchain", e);
        }
    }
}
