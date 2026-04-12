/**
 * DEMO: Chạy AgroTrace contract
 * 
 * Cách 1: Dùng Hardhat
 * npx hardhat run scripts/demo.js --network sepolia
 * 
 * Cách 2: Dùng web3.js (Node.js)
 * node demo.js
 */

const web3 = require('web3');

const RPC_URL = 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID';
const web3Instance = new web3(RPC_URL);

// ABI của AgroTrace contract (Updated)
const ABI = [
    {
        "inputs": [
            {"internalType": "uint256", "name": "_id", "type": "uint256"},
            {"internalType": "string", "name": "_name", "type": "string"},
            {"internalType": "string", "name": "_origin", "type": "string"},
            {"internalType": "string", "name": "_timestamp", "type": "string"}
        ],
        "name": "addProduct",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
        "name": "getProduct",
        "outputs": [
            {"internalType": "string", "name": "", "type": "string"},
            {"internalType": "string", "name": "", "type": "string"},
            {"internalType": "string", "name": "", "type": "string"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
        "name": "productExists",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "_id", "type": "uint256"},
            {"internalType": "string", "name": "_name", "type": "string"},
            {"internalType": "string", "name": "_origin", "type": "string"},
            {"internalType": "string", "name": "_timestamp", "type": "string"}
        ],
        "name": "updateProduct",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
        "name": "deleteProduct",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "uint256", "name": "id", "type": "uint256"},
            {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
            {"indexed": false, "internalType": "string", "name": "origin", "type": "string"},
            {"indexed": false, "internalType": "string", "name": "timestamp", "type": "string"}
        ],
        "name": "ProductAdded",
        "type": "event"
    }
];

// Contract address (sau khi deploy)
const CONTRACT_ADDRESS = '0x...'; // Replace với address sau khi deploy

const contract = new web3Instance.eth.Contract(ABI, CONTRACT_ADDRESS);

// ============= DEMO FUNCTIONS =============

async function demo1_addProduct() {
    console.log('\n📝 DEMO 1: Thêm sản phẩm');
    console.log('================================');
    
    try {
        const tx = await contract.methods.addProduct(
            1,                          // Product ID
            'Cà chua hữu cơ',          // Name
            'Đà Lạt, Lâm Đồng',        // Origin
            '2024-04-12'                // Timestamp
        ).send({
            from: '0x...', // Your account
            gas: 300000
        });
        
        console.log('✅ Transaction successful');
        console.log('TX Hash:', tx.transactionHash);
        console.log('Block:', tx.blockNumber);
    } catch (err) {
        console.log('❌ Error:', err.message);
    }
}

async function demo2_getProduct() {
    console.log('\n📖 DEMO 2: Lấy thông tin sản phẩm');
    console.log('================================');
    
    try {
        const result = await contract.methods.getProduct(1).call();
        
        console.log('Product Name:', result[0]);
        console.log('Origin:', result[1]);
        console.log('Timestamp:', result[2]);
    } catch (err) {
        console.log('❌ Error:', err.message);
    }
}

async function demo3_productExists() {
    console.log('\n🔍 DEMO 3: Kiểm tra sản phẩm tồn tại');
    console.log('================================');
    
    try {
        const exists1 = await contract.methods.productExists(1).call();
        const exists999 = await contract.methods.productExists(999).call();
        
        console.log('Product 1 exists:', exists1 ? '✅ có' : '❌ không');
        console.log('Product 999 exists:', exists999 ? '✅ có' : '❌ không');
    } catch (err) {
        console.log('❌ Error:', err.message);
    }
}

async function demo4_updateProduct() {
    console.log('\n🔄 DEMO 4: Cập nhật sản phẩm');
    console.log('================================');
    
    try {
        const tx = await contract.methods.updateProduct(
            1,                          // Product ID
            'Cà chua hữu cơ (cập nhật)',
            'Đà Lạt, Lâm Đồng',
            '2024-04-13'
        ).send({
            from: '0x...',
            gas: 300000
        });
        
        console.log('✅ Update successful');
        console.log('TX Hash:', tx.transactionHash);
    } catch (err) {
        console.log('❌ Error:', err.message);
    }
}

async function demo5_deleteProduct() {
    console.log('\n❌ DEMO 5: Xóa sản phẩm');
    console.log('================================');
    
    try {
        const tx = await contract.methods.deleteProduct(1).send({
            from: '0x...',
            gas: 300000
        });
        
        console.log('✅ Delete successful');
        console.log('TX Hash:', tx.transactionHash);
    } catch (err) {
        console.log('❌ Error:', err.message);
    }
}

async function demo6_realWorldScenario() {
    console.log('\n🌾 DEMO 6: Kịch bản thực tế');
    console.log('================================');
    
    try {
        // 1. Nông dân thêm dữ liệu cà chua
        console.log('1️⃣ Nông dân thêm dữ liệu cà chua...');
        const tx1 = await contract.methods.addProduct(
            100,
            'Cà chua hữu cơ tươi',
            'Đà Lạt, Lâm Đồng',
            '2024-04-12'
        ).send({
            from: '0x...',
            gas: 300000
        });
        console.log('   ✅ Thêm thành công');
        
        // 2. Sau 1 giây, consumer lấy dữ liệu
        console.log('\n2️⃣ Consumer lấy dữ liệu để verify...');
        await new Promise(r => setTimeout(r, 1000));
        
        const product = await contract.methods.getProduct(100).call();
        console.log('   Product Name:', product[0]);
        console.log('   Origin:', product[1]);
        console.log('   Timestamp:', product[2]);
        
        // 3. Consumer verify dữ liệu
        console.log('\n3️⃣ Consumer xác minh dữ liệu');
        console.log('   ✅ Dữ liệu khớp = sản phẩm là thật!');
        
    } catch (err) {
        console.log('❌ Error:', err.message);
    }
}

async function demo7_events() {
    console.log('\n📡 DEMO 7: Listen to events');
    console.log('================================');
    
    try {
        console.log('Listening to ProductAdded events...');
        
        contract.events.ProductAdded({
            fromBlock: 'latest'
        })
        .on('data', (event) => {
            console.log('\n🔔 Event ProductAdded:');
            console.log('   Product ID:', event.returnValues.id);
            console.log('   Name:', event.returnValues.name);
            console.log('   Origin:', event.returnValues.origin);
            console.log('   Timestamp:', event.returnValues.timestamp);
        })
        .on('error', console.error);
        
    } catch (err) {
        console.log('❌ Error:', err.message);
    }
}

// ============= RUN ALL DEMOS =============

async function runAllDemos() {
    console.log('🚀 AGROTRACE DEMO (Updated)');
    console.log('=================================\n');
    
    // Uncomment để chạy từng demo
    // await demo1_addProduct();
    // await demo2_getProduct();
    // await demo3_productExists();
    // await demo4_updateProduct();
    // await demo5_deleteProduct();
    // await demo6_realWorldScenario();
    // await demo7_events();
    
    console.log('\n✨ Demo hoàn tất!');
}

// Chạy
// runAllDemos().catch(console.log);

module.exports = {
    demo1_addProduct,
    demo2_getProduct,
    demo3_productExists,
    demo4_updateProduct,
    demo5_deleteProduct,
    demo6_realWorldScenario,
    demo7_events
};
