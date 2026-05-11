# Blockchain Architecture

## Canonical path

- **VeChainThor** is the main blockchain path for BICAP submission.
- Backend services use VeChainThor configuration and transaction persistence.
- Blockchain transaction records are stored in the backend DB for traceability and audit evidence.
- Admin governance APIs report readiness without exposing private keys or secret material.

## Governance lifecycle

1. Domain services create local proof data and persist transaction metadata in `blockchain_transactions`.
2. When blockchain write mode is enabled, services attempt to commit proof payloads to VeChainThor.
3. Each attempt stores an operational status:
   - `PENDING`: queued or awaiting finalization
   - `SUCCESS`: proof was committed successfully
   - `FAILED`: commit or validation failed
   - `GOVERNED`: governance validation/evidence record
   - `RETRY_SCHEDULED`: admin or worker scheduled a retry
4. Admin governance can validate runtime readiness and schedule retry for failed records.
5. Validation records are persisted as evidence without mutating production contracts.

## Readiness model

The governance readiness panel/API checks:

- `blockchain.enabled=true`
- valid `BLOCKCHAIN_RPC_URL`
- valid `BLOCKCHAIN_CONTRACT_ADDRESS` or VeChain recipient/to-address equivalent
- signing key availability only for write-mode operations

Read/verify mode can be ready without a private key. Write mode requires secure signing configuration. Private keys are never returned by API responses, UI, logs, or documentation.

## Production-safe contract management

The admin governance action currently performs **validation/manage**, not real deployment. This is deliberate:

- Real deployment requires ABI/bytecode provenance.
- Production signing must use secure key management such as Vault/KMS.
- Gas, chain, rollback, and release approval require an explicit deployment workflow.
- The UI must not silently mutate production smart contracts.

## Sandbox path

- `blockchain/` contains **Hardhat/EVM sandbox and local demo assets only**.
- These assets are for internal testing and development convenience.
- They are **not** the primary submission architecture.

## Wording rule

- In docs/UI, describe the project as VeChainThor-based.
- Do not present Hardhat/EVM as the main deliverable path.
- Avoid “auto deploy” claims unless a secure deployment pipeline is explicitly implemented.
