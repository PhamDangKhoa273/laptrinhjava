package com.bicap.core.service;

import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class BlockchainService {

    /**
     * Giai đoạn 4: Hàm chờ giả lập đẩy dữ liệu lên lưới VeChain (Blockchain).
     * @param data Dữ liệu cần đẩy lên mạng lưới.
     * @return Mã Transaction Hash giả lập.
     */
    public String sendToVeChain(Object data) {
        System.out.println("🔄 [BLOCKCHAIN] Đang giả lập đẩy dữ liệu lên Blockchain... Data: " + data.getClass().getSimpleName());
        // Giả lập một tx_hash trả về từ Blockchain sau khi ghi giao dịch
        return "0x-fake-hash-" + UUID.randomUUID().toString().substring(0, 8);
    }
}
