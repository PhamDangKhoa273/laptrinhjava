// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AgroTrace.sol";

/**
 * DEMO: Cách sử dụng contract AgroTrace
 * 
 * Giả sử:
 * - Owner deployed contract
 * - Người nông dân muốn thêm dữ liệu sản phẩm
 * - Consumer muốn xác minh dữ liệu
 */

contract AgroTraceDemo {
    AgroTrace public agroTrace;
    
    constructor() {
        // Deploy contract AgroTrace
        agroTrace = new AgroTrace();
    }

    // ============= DEMO 1: Thêm sản phẩm =============
    function demo1_addProduct() public {
        // Thêm sản phẩm với ID=1
        // Hash = "QmXxxx..." (IPFS hash của dữ liệu chi tiết)
        agroTrace.addProduct(1, "QmXxxx");
        
        // Log: 
        // emit ProductRecorded(1, "QmXxxx", block.timestamp, msg.sender)
        
        // Thêm sản phẩm khác
        agroTrace.addProduct(2, "QmYyyy");
    }

    // ============= DEMO 2: Lấy dữ liệu sản phẩm =============
    function demo2_getProduct() public view returns (uint256, string memory, uint256, address) {
        // Lấy thông tin sản phẩm ID=1
        (uint256 id, string memory hash, uint256 timestamp, address farmer) = agroTrace.getProduct(1);
        
        return (id, hash, timestamp, farmer);
        
        // Output:
        // id = 1
        // hash = "QmXxxx"
        // timestamp = 1681234567 (thời gian thêm)
        // farmer = 0x1234... (địa chỉ người thêm)
    }

    // ============= DEMO 3: Lấy chỉ hash =============
    function demo3_getHash() public view returns (string memory) {
        // Chỉ lấy hash để verify nhanh
        string memory hash = agroTrace.getProductHash(1);
        return hash;
        
        // Output: "QmXxxx"
    }

    // ============= DEMO 4: Kiểm tra record tồn tại =============
    function demo4_checkExists() public view returns (bool exists1, bool exists999) {
        bool exists1 = agroTrace.productExists(1);      // true (tồn tại)
        bool exists999 = agroTrace.productExists(999);   // false (không tồn tại)
        
        return (exists1, exists999);
    }

    // ============= DEMO 5: Xóa sản phẩm (chỉ owner) =============
    function demo5_deleteProduct() public {
        // Chỉ owner có thể xóa
        agroTrace.deleteProduct(1);
        
        // Log: emit ProductDeleted(1, msg.sender)
        // Sau đó: agroTrace.productExists(1) = false
    }

    // ============= DEMO 6: Error handling =============
    function demo6_errorCases() public {
        // ❌ LỖI 1: Thêm product với ID = 0
        try agroTrace.addProduct(0, "QmXxxx") {
        } catch Error(string memory reason) {
            // Error: "Product ID must be greater than 0"
        }

        // ❌ LỖI 2: Thêm product với hash rỗng
        try agroTrace.addProduct(3, "") {
        } catch Error(string memory reason) {
            // Error: "Hash cannot be empty"
        }

        // ❌ LỖI 3: Thêm product trùng ID
        agroTrace.addProduct(5, "QmHash");
        try agroTrace.addProduct(5, "QmOther") {
        } catch Error(string memory reason) {
            // Error: "Product already exists"
        }

        // ❌ LỖI 4: Lấy product không tồn tại
        try agroTrace.getProduct(999) {
        } catch Error(string memory reason) {
            // Error: "Product does not exist"
        }

        // ❌ LỖI 5: Xóa product không phải owner
        // Nếu không phải owner, sẽ revert
        // Error: "Only owner can call this function"
    }

    // ============= DEMO 7: Use case thực tế =============
    function demo7_realWorldScenario() public {
        // Kịch bản: Nông dân ghi dữ liệu nông sản lên blockchain

        // 1️⃣ Nông dân A thêm dữ liệu cà chua
        agroTrace.addProduct(
            100,  // ID = 100 (mã sản phẩm)
            "QmAbcd...xyz"  // Hash IPFS chứa: tên, địa điểm, ngày trồng, v.v
        );

        // 2️⃣ Consumer muốn verify
        (
            uint256 productId,
            string memory dataHash,
            uint256 recordTime,
            address farmer
        ) = agroTrace.getProduct(100);

        // 3️⃣ Consumer download dữ liệu từ IPFS dùng hash "QmAbcd...xyz"
        // 4️⃣ Consumer verify hash của dữ liệu downloaded = hash trên blockchain
        // → Dữ liệu là thật, không bị giả mạo!

        // 5️⃣ Sau khi verify xong, transaction hash được lưu vĩnh viễn trên blockchain
    }
}

/**
 * HƯỚNG DẪN CHẠY DEMO:
 * 
 * Nếu dùng Hardhat:
 * 
 * 1. npx hardhat console
 * 2. const demo = await AgroTraceDemo.deploy()
 * 3. await demo.demo1_addProduct()
 * 4. const result = await demo.demo2_getProduct()
 * 5. console.log(result)
 * 
 * 
 * Hoặc dùng Remix IDE:
 * 1. Copy file AgroTrace.sol và AgroTraceDemo.sol vào Remix
 * 2. Compile
 * 3. Deploy AgroTraceDemo
 * 4. Gọi từng function demo
 * 
 * 
 * Dòng timeline trong demo:
 * 
 * addProduct(1, "QmXxxx")
 *         ↓
 *   Storage: records[1] = {
 *       productId: 1,
 *       dataHash: "QmXxxx",
 *       timestamp: 1681234567,
 *       recordedBy: 0x1234...,
 *       exists: true
 *   }
 *         ↓
 *   Emit event: ProductRecorded(1, "QmXxxx", 1681234567, 0x1234...)
 *         ↓
 *   Event được lưu trên blockchain log
 *         ↓
 *   Indexers (The Graph, Etherscan) đọc event
 *         ↓
 *   User có thể query từ lịch sử (indexer / explorer)
 */
