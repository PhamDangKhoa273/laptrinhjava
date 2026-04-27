# Security Review Checklist (BICAP)

## Secrets
- [ ] APP_JWT_SECRET is set, >= 32 chars, unique per environment
- [ ] No secrets committed in repo (.env files are examples only)
- [ ] Blockchain private key never stored in plaintext on disk in production (use secret manager)

## Auth / Session
- [ ] Access token expiry configured
- [ ] Refresh token used only for /auth/refresh
- [ ] Password reset token expiry enforced
- [ ] Brute-force protection (rate limit) enabled

## Authorization (RBAC)
- [ ] Every write endpoint has @PreAuthorize
- [ ] Admin-only governance endpoints are ADMIN-restricted
- [ ] Public endpoints are explicitly allowlisted

## Transport
- [ ] TLS at ingress (https)
- [ ] Secure cookies if any (N/A for pure token auth)

## CORS
- [ ] app.cors.allowed-origins set to exact production domains
- [ ] No wildcard origins in production

## Headers
- [ ] CSP present (backend SecurityConfig)
- [ ] X-Frame-Options / frame-ancestors appropriate
- [ ] Consider HSTS at reverse proxy

## Data validation
- [ ] DTO constraints cover required fields
- [ ] Reject empty/blank strings where needed
- [ ] Validate numeric ranges and enums

## Logging / Observability
- [ ] Audit log for auth success/failure
- [ ] No PII or secrets in logs
- [ ] Actuator endpoints exposed minimally

## Dependency hygiene
- [ ] Run dependency vulnerability scan in CI

## Backups
- [ ] MySQL backup strategy
- [ ] Redis persistence strategy (AOF) or treat as cache only
