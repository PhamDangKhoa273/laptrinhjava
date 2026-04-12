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

// ABI của AgroTrace contract
const ABI = [
    {
        "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}, 
                   {"internalType": "string", "name": "_hash", "type": "string"}],
        "name": "addProduct",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
        "name": "getProduct",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"},
            {"internalType": "string", "name": "", "type": "string"},
            {"internalType": "uint256", "name": "", "type": "uint256"},
            {"internalType": "address", "name": "", "type": "address"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
        "name": "getProductHash",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
        "name": "productExists",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
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
            1,              // Product ID
            'QmXxxx...'     // Hash (IPFS)
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
        
        console.log('Product ID:', result[0]);
        console.log('Data Hash:', result[1]);
        console.log('Timestamp:', new Date(result[2] * 1000));
        console.log('Recorded By:', result[3]);
    } catch (err) {
        console.log('❌ Error:', err.message);
    }
}

async function demo3_getHash() {
    console.log('\n⚡ DEMO 3: Lấy hash nhanh');
    console.log('================================');
    
    try {
        const hash = await contract.methods.getProductHash(1).call();
        console.log('Hash:', hash);
    } catch (err) {
        console.log('❌ Error:', err.message);
    }
}

async function demo4_productExists() {
    console.log('\n🔍 DEMO 4: Kiểm tra sản phẩm tồn tại');
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

async function demo5_realWorldScenario() {
    console.log('\n🌾 DEMO 5: Kịch bản thực tế');
    console.log('================================');
    
    try {
        // 1. Nông dân thêm dữ liệu cà chua
        console.log('1️⃣ Nông dân thêm dữ liệu cà chua...');
        const tx1 = await contract.methods.addProduct(
            100,
            'QmAbcd...xyz'
        ).send({
            from: '0x...',
            gas: 300000
        });
        console.log('   ✅ Thêm thành công');
        
        // 2. Sau 1 giây, consumer lấy dữ liệu
        console.log('\n2️⃣ Consumer lấy dữ liệu để verify...');
        await new Promise(r => setTimeout(r, 1000));
        
        const product = await contract.methods.getProduct(100).call();
        console.log('   Product ID:', product[0]);
        console.log('   Data Hash:', product[1]);
        console.log('   Farmer:', product[3]);
        
        // 3. Consumer verify hash
        console.log('\n3️⃣ Consumer download dữ liệu từ IPFS (hash: ' + product[1] + ')');
        console.log('   và compare với hash trên blockchain');
        console.log('   ✅ Dữ liệu match = sản phẩm là thật!');
        
    } catch (err) {
        console.log('❌ Error:', err.message);
    }
}

async function demo6_events() {
    console.log('\n📡 DEMO 6: Listen to events');
    console.log('================================');
    
    try {
        console.log('Listening to ProductRecorded events...');
        
        contract.events.ProductRecorded({
            fromBlock: 'latest'
        })
        .on('data', (event) => {
            console.log('\n🔔 Event ProductRecorded:');
            console.log('   Product ID:', event.returnValues.productId);
            console.log('   Hash:', event.returnValues.dataHash);
            console.log('   Farmer:', event.returnValues.recordedBy);
        })
        .on('error', console.error);
        
    } catch (err) {
        console.log('❌ Error:', err.message);
    }
}

// ============= RUN ALL DEMOS =============

async function runAllDemos() {
    console.log('🚀 AGROTRACE DEMO');
    console.log('=================================\n');
    
    // Uncomment để chạy từng demo
    // await demo1_addProduct();
    // await demo2_getProduct();
    // await demo3_getHash();
    // await demo4_productExists();
    // await demo5_realWorldScenario();
    // await demo6_events();
    
    console.log('\n✨ Demo hoàn tất!');
}

// Chạy
// runAllDemos().catch(console.log);

module.exports = {
    demo1_addProduct,
    demo2_getProduct,
    demo3_getHash,
    demo4_productExists,
    demo5_realWorldScenario,
    demo6_events
};
