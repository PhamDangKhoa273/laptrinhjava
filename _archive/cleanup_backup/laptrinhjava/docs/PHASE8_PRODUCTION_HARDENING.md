# Phase 8 - Production Hardening (BICAP)

## What was added

### Redis cache
- docker-compose now includes `redis:7.4-alpine`.
- Backend supports Redis cache via:
  - `spring-boot-starter-cache`
  - `spring-boot-starter-data-redis`
  - `@EnableCaching` (`com.bicap.core.config.CacheConfig`)

**Env vars (docker-compose backend):**
- `SPRING_DATA_REDIS_HOST=redis`
- `SPRING_DATA_REDIS_PORT=6379`
- `SPRING_CACHE_TYPE=redis`

### Observability (basic)
- Added Spring Boot Actuator.
- Exposed endpoints (configurable via env):
  - `/actuator/health`
  - `/actuator/info`
  - `/actuator/metrics`
  - `/actuator/prometheus`

### Rate limiting
- `RateLimitFilter` is enabled in `SecurityConfig`.
- Defaults:
  - `app.rate-limit.max-requests=30`
  - `app.rate-limit.window-seconds=60`

### CORS / Security config hardening
- Removed per-controller `@CrossOrigin`.
- Centralized CORS config in `SecurityConfig` using `app.cors.allowed-origins`.

### Secrets hardening
- `JwtTokenProvider` now fails fast if `APP_JWT_SECRET` is missing or too short (< 32 chars).

## Run with Docker

```bash
docker compose up --build
```

## Notes
- For real cloud deployment, add:
  - managed MySQL + managed Redis
  - secrets manager for JWT secret & blockchain private key
  - ingress + TLS
  - centralized logs/metrics/tracing
