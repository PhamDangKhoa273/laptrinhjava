# BICAP Production Deployment Checklist

## 1. Secrets and environment

- [ ] `.env.prod` is created from `.env.prod.example` and is not committed.
- [ ] `APP_JWT_SECRET` is a strong random secret.
- [ ] Database passwords are unique and stored in a secret manager or protected host env file.
- [ ] Payment/subscription gateway secrets are configured.
- [ ] Blockchain or VeChain private keys are injected only when those integrations are enabled.
- [ ] `APP_CORS_ALLOWED_ORIGINS` contains only production domains.
- [ ] `APP_FRONTEND_URL` matches the deployed HTTPS origin.

## 2. Container health

- [ ] MySQL healthcheck reports healthy.
- [ ] Redis healthcheck reports healthy.
- [ ] Backend `/actuator/health/readiness` reports healthy.
- [ ] Frontend `/healthz` reports `ok`.
- [ ] Backend is internal-only in production and reachable through frontend `/api/` proxy or an API gateway.

## 3. Build and release

- [ ] Backend image is built and tagged with immutable version.
- [ ] Frontend image is built and tagged with immutable version.
- [ ] `docker compose -f docker-compose.prod.yml --env-file .env.prod config` renders successfully.
- [ ] Database migrations have been reviewed before rollout.
- [ ] Rollback image tags are known.

## 4. Security posture

- [ ] HTTPS/TLS is terminated at load balancer, ingress, or reverse proxy.
- [ ] Security headers are verified on frontend responses.
- [ ] Actuator endpoints are restricted according to environment policy.
- [ ] Rate-limit settings are appropriate for expected traffic.
- [ ] Public backend port `8080` is not exposed unless intentionally needed for a controlled demo.

## 5. Data durability

- [ ] MySQL volume or managed database backup policy is active.
- [ ] Redis persistence expectations are documented.
- [ ] Uploaded media volume is backed up if local container storage is used.
- [ ] Restore drill command/process is documented.

## 6. Post-deploy smoke checks

- [ ] `/healthz` returns `ok`.
- [ ] `/api/actuator/health/readiness` returns healthy through the proxy or internal network.
- [ ] `/marketplace` loads publicly.
- [ ] `/public/trace` loads publicly.
- [ ] Protected route unauthenticated access redirects to `/login`.
- [ ] One account per role can log in and lands on the correct workspace.
