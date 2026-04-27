# BICAP Workspace

Repository gốc của dự án **BICAP**.

## Cấu trúc

- `backend/` , backend Spring Boot
- `frontend/` , frontend React
- `docs/` , tài liệu thiết kế và audit
- `blockchain/` , sandbox smart contract / local demo only, không phải main blockchain path của submission
- `docker-compose.yml` , môi trường chạy cục bộ
- `tmp/` , file tạm, script kiểm tra, output sinh ra trong quá trình làm việc

## Ghi chú

- File tạm ở root không phải artifact chính thức, nên chuyển vào `tmp/` khi không còn cần thiết.
- Root Maven hiện quản lý `backend/` như module chính.

## Reproducible local build

### Prerequisites
- Java 21+
- Node.js 20+
- npm 10+
- MySQL 8+ if you run backend outside Docker
- Docker + Docker Compose if you want the one-command local stack

### Environment variables

Backend local env: copy `.env.example` to `.env` and fill:
- `VECHAIN_NETWORK`
- `THOR_NODE_URL`
- `VECHAIN_PRIVATE_KEY`

Profile strategy:
- `local` for developer machine defaults
- `test` for CI and isolated verification
- `staging` for pre-prod with env-only config
- `prod` for live deployment with env-only config

Production env: copy `.env.prod.example` to `.env.prod` and fill:
- `APP_JWT_SECRET` (32+ chars)
- `MYSQL_ROOT_PASSWORD`
- `APP_CORS_ALLOWED_ORIGINS`
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `SPRING_DATA_REDIS_HOST`
- `APP_MEDIA_UPLOAD_DIR`
- `SPRING_MAIL_HOST`
- `SPRING_MAIL_USERNAME`
- `SPRING_MAIL_PASSWORD`

### Startup order

#### Option A, Docker (recommended for first run)
```bash
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:8080

#### Option B, manual clone-from-scratch
1) Backend
```bash
cd backend
./mvnw test
```

2) Frontend
```bash
cd frontend
npm ci
npm run build
```

### Seed data
- Seed data is created by Flyway migrations, especially:
  - `backend/src/main/resources/db/migration/V2__seed_phase2_core_data.sql`
  - `backend/src/main/resources/db/migration/V22__cleanup_demo_accounts_and_add_guest_seed.sql`
  - `backend/src/main/resources/db/migration/V24__synchronize_demo_passwords.sql`
- These migrations create the demo roles, users, farm, retailer, driver, vehicle, package, subscription, and guest account.

### Demo accounts
Password for all seeded demo accounts: set via seed migration or `.env.local` for local-only demo runs

- `admin@bicap.com` , ADMIN
- `farm@bicap.com` , FARM
- `retailer@bicap.com` , RETAILER
- `manager@bicap.com` , SHIPPING_MANAGER
- `driver@bicap.com` , DRIVER
- `guest@bicap.com` , GUEST

If you rotate or replace the seed set, update this README alongside the migration scripts so reviewers can log in without rescue.

### CI
- GitHub Actions workflow: `.github/workflows/ci.yml`
- PR gate checklist: `.github/PR_CHECKLIST.md`
- Checks: backend wrapper/version/test, frontend install/lint/build, migration presence, basic secret scan, README seed/demo alignment
- Required merge rule: all CI checks green before merge

### Observability
- http://localhost:8080/actuator/health
- http://localhost:8080/actuator/metrics
- http://localhost:8080/actuator/prometheus
