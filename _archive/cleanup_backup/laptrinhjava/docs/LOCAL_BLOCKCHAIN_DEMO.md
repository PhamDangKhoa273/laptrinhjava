# Local Blockchain Demo (Hardhat) - BICAP

## 1) Start local chain

```bash
cd blockchain
npm run node
```

RPC: http://127.0.0.1:8545
ChainId: 31337

Use Hardhat Account #0 private key for local signing (safe, public dev key).

## 2) Deploy contract to local chain

Open a new terminal:

```bash
cd blockchain
npm run deploy:local
```

It prints JSON:

```json
{ "contract":"AgroTrace", "address":"0x...", "chainId":31337 }
```

## 3) Point backend to local chain

Set env vars for backend:

- `BLOCKCHAIN_ENABLED=true`
- `BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545`
- `BLOCKCHAIN_CHAIN_ID=31337`
- `BLOCKCHAIN_CONTRACT_ADDRESS=<address from deploy:local>`
- `BLOCKCHAIN_PRIVATE_KEY=<hardhat account #0 private key>`

Then run backend normally.

## 4) Validate from admin governance API

- POST `/api/v1/blockchain/governance/deploy` with `{ "dryRun": true }`
- GET `/api/v1/blockchain/governance/config`

## Notes
- Local keys are public dev keys. Never use them on live networks.
