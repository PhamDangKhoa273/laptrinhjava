---
title: Tech Stack — Pinned Versions
ids: []
status: active
last-reviewed: 2026-05-16
language: en
---

# Tech Stack — Pinned Versions

Pinned dependency versions. Source-of-truth files are authoritative; this doc mirrors for human reference. If versions diverge, treat the source-of-truth as canonical.

## Backend (`backend/pom.xml`)

| Component | Version | Source |
|---|---|---|
| Java | 17 | `<java.version>` |
| Spring Boot | 3.2.5 | parent |
| Spring Data JPA | (managed by Spring Boot 3.2.5) | starter |
| Spring Security | (managed) | starter |
| Spring Web | (managed) | starter |
| Spring Data Redis | (managed) | starter |
| Spring Mail | (managed) | starter |
| Spring Actuator | (managed) | starter |
| Lombok | 1.18.36 | `<lombok.version>` |
| JJWT | 0.12.5 | `<jjwt.version>` |
| SpringDoc OpenAPI | 2.5.0 | `<springdoc.version>` |
| MySQL Connector/J | (managed) | dependency |
| Flyway | (managed) | flyway-core, flyway-mysql |
| Micrometer Prometheus | (managed) | dependency |
| ZXing Core | 3.5.3 | dependency (QR generation) |
| ZXing Java SE | 3.5.3 | dependency |
| Web3j core | 4.10.3 | dependency |
| Web3j crypto | 5.0.0 | dependency |
| Jsoup | 1.17.2 | dependency (sanitization) |
| Bouncy Castle | 1.66 | bcprov-jdk15on, bcpkix-jdk15on |
| Spongy Castle | 1.58.0.0 | dependency |
| Bitcoinj core | 0.14.7 | dependency |
| Guava | 29.0-jre | dependency |
| Gson | 2.8.6 | dependency |
| Headlong | 4.0.0 | dependency |
| VeChain DevKit | 0.9.9 | system jar in `backend/libs/thor-devkit-0.9.9.jar` |

## Frontend (`frontend/package.json`)

| Component | Version | Source |
|---|---|---|
| Node.js | 20+ | runtime requirement (README) |
| npm | 10+ | runtime requirement |
| React | ^18.3.1 | dependency |
| React DOM | ^18.3.1 | dependency |
| React Router DOM | ^7.13.2 | dependency |
| Vite | ^8.0.1 | devDependency |
| @vitejs/plugin-react | ^6.0.1 | devDependency |
| TypeScript | ^6.0.3 | devDependency |
| Vitest | ^4.1.5 | devDependency |
| jsdom | ^29.0.2 | devDependency |
| Testing Library (react) | ^16.3.2 | devDependency |
| Testing Library (jest-dom) | ^6.9.1 | devDependency |
| ESLint | ^9.39.4 | devDependency |
| eslint-plugin-react-hooks | ^7.0.1 | devDependency |
| eslint-plugin-react-refresh | ^0.5.2 | devDependency |
| globals | ^17.4.0 | devDependency |
| @eslint/js | ^9.39.4 | devDependency |
| axios | ^1.14.0 | dependency |
| dompurify | ^3.4.1 | dependency (sanitization) |
| html5-qrcode | ^2.3.8 | dependency (QR scan in browser) |
| jsqr | ^1.4.0 | dependency (QR decode fallback) |
| @capacitor/core | ^8.3.1 | dependency (mobile shell for driver app) |
| @capacitor/android | ^8.3.1 | dependency |
| @capacitor/cli | ^8.3.1 | dependency |

## Infrastructure (`docker-compose.yml`)

| Component | Version | Source |
|---|---|---|
| MySQL | 8.4 | `mysql:8.4` image |
| Redis | 7.4-alpine | `redis:7.4-alpine` image |
| VeChainThor | v2.1.0 | `ghcr.io/vechain/thor:v2.1.0` |
| Nginx | (frontend Dockerfile multi-stage) | `frontend/nginx.conf` |

## Blockchain Sandbox (`blockchain/package.json`)

Internal dev only — not the canonical chain. See [`adrs/ADR-002-vechainthor-canonical-chain.md`](adrs/ADR-002-vechainthor-canonical-chain.md).

| Component | Version | Notes |
|---|---|---|
| Hardhat | (read from `blockchain/package.json`) | Sandbox / local demo only |

## Update Procedure

When upgrading any component:

1. Update source-of-truth file (`pom.xml`, `package.json`, `docker-compose.yml`).
2. Update the matching row in this table.
3. If the upgrade affects API contracts or behavior, open an ADR (e.g., Spring Boot major version).
4. Run `mvnw test` and `npm run build` to confirm no breakage.
