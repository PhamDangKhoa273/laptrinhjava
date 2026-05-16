---
id: ADR-002
title: VeChainThor as Canonical Blockchain
status: accepted
date: 2026-05-16
decision: VeChainThor là blockchain chính tắc cho proof of traceability; Hardhat sandbox dưới `blockchain/` chỉ là internal demo, không deploy production.
context: BICAP cần blockchain để cung cấp traceability immutable; Brief yêu cầu VeChainThor crypto standards; codebase đã có VeChain integration và Hardhat sandbox.
consequences: VeChain integration được wrap qua `TraceabilityProofService`; Hardhat assets giữ trong `blockchain/` cho dev demo, không trộn vào production submission.
---

# ADR-002 — VeChainThor as Canonical Blockchain

## Status

accepted

## Context

Brief yêu cầu: "Blockchain (VeChainThor) cần hỗ trợ nhiều giao dịch đồng thời..." và "Các tiêu chuẩn mã hóa của VeChainThor cần được sử dụng để bảo mật thông tin." Codebase có cả VeChain integration (`modules/vechain/`) và Hardhat sandbox (`blockchain/`).

Cần quyết định path nào là canonical để team không vô tình trộn 2 paths.

## Decision

**VeChainThor là canonical:**

- Backend services dùng `TraceabilityProofService` interface (production impl: `VeChainTraceabilityProofService` → `VeChainProofService`).
- `BlockchainTransaction` entity persists tx metadata cho traceability.
- Admin governance API validate readiness mà không expose private keys ([`BR-VCH-010`](../../02-domain/business-rules.md)).
- VeChain crypto standards dùng cho signing và transaction submission.

**Hardhat sandbox là internal-only:**

- `blockchain/` directory chứa Hardhat assets cho local dev demo và internal testing.
- Không phải primary submission path.
- Docs/UI mô tả BICAP là VeChainThor-based, không quảng bá Hardhat/EVM là main deliverable.

## Consequences

- **Positive:**
  - Một path duy nhất cho production proof commits
  - Business code không coupled trực tiếp với low-level blockchain client
  - Dễ stub VeChain trong tests qua interface `TraceabilityProofService`
- **Negative:**
  - Nhiều integration code chỉ chạy production khi VeChainThor reachable
  - Cần env-only signing key management cho production (link với `NFR-SEC-030`)
- **Follow-up:**
  - Production deployment phải dùng KMS hoặc Vault cho signing key, không dùng demo private key trong `.env`
  - Không "auto-deploy" smart contracts trong UI mà không có secure deployment pipeline
  - [`GAP-001`](../../09-governance/gap-register.md): Brief yêu cầu admin deploy smart contracts; current code chỉ validate/manage. Quyết định "build deploy pipeline" hoặc "revise Brief" pending.

## Alternatives Considered

- **Hardhat/EVM testnet:** Reject. Brief explicit yêu cầu VeChainThor; testnet không phải production-grade proof.
- **No blockchain (DB-only proof):** Reject. Mất tính minh bạch và bất biến mà Brief yêu cầu (NFR-BC-020).
