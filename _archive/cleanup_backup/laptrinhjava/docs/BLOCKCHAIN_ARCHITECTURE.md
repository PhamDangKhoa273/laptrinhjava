# Blockchain Architecture

## Canonical path
- **VeChainThor** is the main blockchain path for BICAP submission.
- Backend services use VeChainThor configuration and transaction persistence.
- Blockchain transaction records are stored in the backend DB for traceability.

## Sandbox path
- `blockchain/` contains **Hardhat/EVM sandbox and local demo assets only**.
- These assets are for internal testing and development convenience.
- They are **not** the primary submission architecture.

## Wording rule
- In docs/UI, describe the project as VeChainThor-based.
- Do not present Hardhat/EVM as the main deliverable path.
